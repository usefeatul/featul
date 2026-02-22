import { HTTPException } from "hono/http-exception"
import { eq, and, sql } from "drizzle-orm"
import { j, privateProcedure, publicProcedure } from "../jstack"
import { workspace, workspaceMember, board, brandingConfig, tag, post, workspaceDomain, workspaceSlugReservation, user, subscription } from "@featul/db"
import { createWorkspaceInputSchema, checkSlugInputSchema, updateCustomDomainInputSchema, createDomainInputSchema, verifyDomainInputSchema, updateWorkspaceNameInputSchema, deleteWorkspaceInputSchema, importCsvInputSchema, updateTimezoneInputSchema } from "../validators/workspace"
import { getTopLevelDomain, normalizeDomainHost } from "../validators/domain"
import { Resolver } from "node:dns/promises"
import { normalizeStatus } from "../shared/status"
import { addDomainToProject, removeDomainFromProject } from "../services/vercel"
import { normalizePlan, isDataImportsAllowed } from "../shared/plan"
import { seedWorkspaceOnboarding } from "../services/onboarding"
import { runWorkspaceCsvImport } from "../services/workspace-csv-import"

const dnsResolver = new Resolver()

async function hasResolvableTopLevelDomain(host: string) {
  const tld = getTopLevelDomain(host)
  if (!tld) return false
  try {
    const records = await dnsResolver.resolveNs(tld)
    return records.length > 0
  } catch {
    return false
  }
}

async function requireWorkspaceManagerWithPlan(ctx: any, slug: string) {
  const [ws] = await ctx.db
    .select({ id: workspace.id, ownerId: workspace.ownerId, plan: workspace.plan })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

  const meId = ctx.session.user.id
  let allowed = ws.ownerId === meId
  if (!allowed) {
    const [me] = await ctx.db
      .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
      .from(workspaceMember)
      .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
      .limit(1)
    const perms = (me?.permissions || {}) as Record<string, boolean>
    if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
  }
  if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

  return ws
}

export function createWorkspaceRouter() {
  return j.router({
    ping: publicProcedure.get(({ c }) => {
      return c.json({ message: "pong" })
    }),
    bySlug: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, domain: workspace.domain, customDomain: workspace.customDomain, logo: workspace.logo, timezone: workspace.timezone, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=300")
        if (!ws) return c.json({ workspace: null })
        return c.superjson({ workspace: ws })
      }),
    checkSlug: privateProcedure
      .input(checkSlugInputSchema)
      .post(async ({ ctx, input, c }) => {
        const slug = input.slug.toLowerCase()
        const existing = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, slug))
          .limit(1)
        if (existing.length > 0) return c.json({ available: false })

        const now = new Date()
        const meEmail = (ctx.session.user.email || '').toLowerCase()
        const [resv] = await ctx.db
          .select({ email: workspaceSlugReservation.email, status: workspaceSlugReservation.status, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.slug, slug))
          .limit(1)
        const active = resv && resv.status === 'reserved' && resv.expiresAt && resv.expiresAt.getTime() > now.getTime()
        const mine = active && String(resv?.email || '').toLowerCase() === meEmail
        return c.json({ available: !active || mine })
      }),

    exists: privateProcedure.get(async ({ ctx, c }) => {
      const userId = ctx.session.user.id
      const owned = await ctx.db
        .select({ id: workspace.id })
        .from(workspace)
        .where(eq(workspace.ownerId, userId))
        .limit(1)
      const member = await ctx.db
        .select({ id: workspaceMember.id })
        .from(workspaceMember)
        .where(eq(workspaceMember.userId, userId))
        .limit(1)
      return c.json({ hasWorkspace: owned.length > 0 || member.length > 0 })
    }),

    listMine: privateProcedure.get(async ({ ctx, c }) => {
      const userId = ctx.session.user.id
      const [owned, member] = await Promise.all([
        ctx.db
          .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, logo: workspace.logo, domain: workspace.domain, customDomain: workspace.customDomain, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.ownerId, userId)),
        ctx.db
          .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, logo: workspace.logo, domain: workspace.domain, customDomain: workspace.customDomain, plan: workspace.plan })
          .from(workspaceMember)
          .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
          .where(and(eq(workspaceMember.userId, userId), eq(workspaceMember.isActive, true))),
      ])

      const all = [...owned, ...member]
      const map = new Map<string, typeof all[0]>()
      for (const w of all) map.set(w.slug, w)
      c.header("Cache-Control", "private, max-age=30, stale-while-revalidate=300")
      return c.superjson({ workspaces: Array.from(map.values()) })
    }),

    statusCounts: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ counts: {} })

        const rows = await ctx.db
          .select({ status: post.roadmapStatus, count: sql<number>`count(*)` })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(board.isPublic, true)))
          .groupBy(post.roadmapStatus)

        const counts: Record<string, number> = {}
        for (const r of rows as { status: string | null; count: string }[]) {
          const key = normalizeStatus(String(r.status || "pending"))
          counts[key] = (counts[key] || 0) + Number(r.count || 0)
        }
        for (const key of ["planned", "progress", "review", "completed", "pending", "closed"]) {
          if (typeof counts[key] !== "number") counts[key] = 0
        }
        c.header("Cache-Control", "private, no-store")
        return c.json({ counts })
      }),

    create: privateProcedure
      .input(createWorkspaceInputSchema)
      .post(async ({ ctx, input, c }) => {
        const slug = input.slug.toLowerCase()
        const exists = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, slug))
          .limit(1)
        if (exists.length > 0) {
          throw new HTTPException(409, { message: "Slug is already taken" })
        }

        // If a reservation exists for this slug, enforce email ownership
        const [resv] = await ctx.db
          .select({ id: workspaceSlugReservation.id, email: workspaceSlugReservation.email, status: workspaceSlugReservation.status, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.slug, slug))
          .limit(1)
        if (resv) {
          const expired = resv.expiresAt && resv.expiresAt.getTime() < Date.now()
          const active = resv.status === "reserved" && !expired
          const myEmail = (ctx.session.user.email || "").toLowerCase()
          if (active && myEmail !== String(resv.email || "").toLowerCase()) {
            throw new HTTPException(403, { message: "Slug is reserved by another email" })
          }
        }

        const host = (() => {
          try {
            return new URL(input.domain.trim()).host
          } catch {
            return input.domain.trim()
          }
        })()
        const favicon = `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(host)}&sz=128`

        let created: typeof workspace.$inferSelect | undefined
        try {
          const [ws] = await ctx.db
            .insert(workspace)
            .values({
              name: input.name.trim(),
              slug,
              domain: input.domain.trim(),
              ownerId: ctx.session.user.id,
              timezone: input.timezone,
              logo: favicon,
            })
            .returning()
          created = ws

          await ctx.db.insert(workspaceMember).values({
            workspaceId: ws.id,
            userId: ctx.session.user.id,
            role: "admin",
            permissions: {
              canManageWorkspace: true,
              canManageBilling: true,
              canManageMembers: true,
              canManageBoards: true,
              canModerateAllBoards: true,
              canConfigureBranding: true,
            },
            joinedAt: new Date(),
          })

          // Create subscription record (every workspace gets a free plan by default)
          await ctx.db.insert(subscription).values({
            workspaceId: ws.id,
            plan: 'free',
            status: 'active',
            billingCycle: 'monthly',
          })

          await ctx.db.insert(brandingConfig).values({
            workspaceId: ws.id,
          })

          await ctx.db.insert(board).values([
            {
              workspaceId: ws.id,
              name: "Features",
              slug: "features",
              sortOrder: 0,
              createdBy: ctx.session.user.id,
              isSystem: false,
              allowAnonymous: true,
            },
            {
              workspaceId: ws.id,
              name: "Bugs",
              slug: "bugs",
              sortOrder: 1,
              createdBy: ctx.session.user.id,
              isSystem: false,
              allowAnonymous: true,
            },
            {
              workspaceId: ws.id,
              name: "Roadmap",
              slug: "roadmap",
              sortOrder: 2,
              createdBy: ctx.session.user.id,
              isSystem: true,
              systemType: "roadmap",
              allowAnonymous: true,
            },
            {
              workspaceId: ws.id,
              name: "Changelog",
              slug: "changelog",
              sortOrder: 3,
              createdBy: ctx.session.user.id,
              isSystem: true,
              systemType: "changelog",
              allowAnonymous: true,
            },
          ])

          await ctx.db.insert(tag).values([
            { workspaceId: ws.id, name: "UI", slug: "ui" },
            { workspaceId: ws.id, name: "Design", slug: "design" },
            { workspaceId: ws.id, name: "Security", slug: "security" },
            { workspaceId: ws.id, name: "Bugs", slug: "bugs" },
            { workspaceId: ws.id, name: "Support", slug: "support" },
          ])

          await seedWorkspaceOnboarding(ctx.db, ws.id, ctx.session.user.id)

          // Mark reservation as claimed
          try {
            const myEmail = (ctx.session.user.email || "").toLowerCase()
            const [r] = await ctx.db
              .select({ id: workspaceSlugReservation.id })
              .from(workspaceSlugReservation)
              .where(and(eq(workspaceSlugReservation.slug, slug), eq(workspaceSlugReservation.email, myEmail)))
              .limit(1)
            if (r?.id) {
              await ctx.db
                .update(workspaceSlugReservation)
                .set({ status: "claimed", claimedAt: new Date(), claimedByUserId: ctx.session.user.id, updatedAt: new Date() })
                .where(eq(workspaceSlugReservation.id, r.id))
            }
          } catch { }
        } catch {
          if (created?.id) {
            try {
              await ctx.db.delete(workspace).where(eq(workspace.id, created.id))
            } catch { }
          }
          throw new HTTPException(500, { message: "Failed to provision workspace" })
        }

        return c.superjson({ workspace: created })
      }),

    updateCustomDomain: privateProcedure
      .input(updateCustomDomainInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, plan: workspace.plan, domain: workspace.domain, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })
        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const planKey = normalizePlan(String(ws.plan || "free"))
        if (!(planKey === "starter" || planKey === "professional")) {
          throw new HTTPException(403, { message: "Custom domain available on Starter or Professional plans" })
        }

        const host = (() => {
          try {
            return normalizeDomainHost(new URL(String(ws.domain)).hostname)
          } catch {
            return normalizeDomainHost(String(ws.domain).replace(/^https?:\/\//, ""))
          }
        })()

        const desired = input.enabled
          ? normalizeDomainHost(String(input.customDomain || `feedback.${host}`))
          : null
        if (desired && !(await hasResolvableTopLevelDomain(desired))) {
          throw new HTTPException(400, { message: "Invalid domain TLD" })
        }

        await ctx.db
          .update(workspace)
          .set({ customDomain: desired || null, updatedAt: new Date() })
          .where(eq(workspace.id, ws.id))

        return c.superjson({ ok: true, customDomain: desired })
      }),

    domainInfo: privateProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, domain: workspace.domain, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ domain: null })

        const [d] = await ctx.db
          .select({ id: workspaceDomain.id, host: workspaceDomain.host, cnameName: workspaceDomain.cnameName, cnameTarget: workspaceDomain.cnameTarget, txtName: workspaceDomain.txtName, txtValue: workspaceDomain.txtValue, status: workspaceDomain.status })
          .from(workspaceDomain)
          .where(eq(workspaceDomain.workspaceId, ws.id))
          .limit(1)

        return c.superjson({ domain: d || null, plan: ws.plan, defaultDomain: ws.domain })
      }),

    createDomain: privateProcedure
      .input(createDomainInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, plan: workspace.plan, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })
        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
        const planKey = normalizePlan(String(ws.plan || "free"))
        if (!(planKey === "starter" || planKey === "professional")) {
          throw new HTTPException(403, { message: "Custom domain available on Starter or Professional plans" })
        }

        const url = new URL(input.domain)
        const host = normalizeDomainHost(url.hostname)
        if (!(await hasResolvableTopLevelDomain(host))) {
          throw new HTTPException(400, { message: "Invalid domain TLD" })
        }
        const parts = host.split('.')
        if (parts.length < 2) throw new HTTPException(400, { message: "Invalid domain host" })
        const cnameName = parts[0]

        const DEFAULT_CNAME_TARGET = process.env.CUSTOM_DOMAIN_CNAME_TARGET || 'origin.featul.com'
        const txtName = `_acme-challenge.${host}`
        const token = crypto.randomUUID()

        const [existing] = await ctx.db
          .select({ id: workspaceDomain.id })
          .from(workspaceDomain)
          .where(eq(workspaceDomain.workspaceId, ws.id))
          .limit(1)
        if (existing) throw new HTTPException(409, { message: 'A domain is already configured. Delete it before adding a new one.' })
        await ctx.db.insert(workspaceDomain).values({ workspaceId: ws.id, host, cnameName, cnameTarget: DEFAULT_CNAME_TARGET, txtName, txtValue: token })

        return c.superjson({ ok: true, host, records: { cname: { name: cnameName, value: DEFAULT_CNAME_TARGET }, txt: { name: txtName, value: token } } })
      }),

    verifyDomain: privateProcedure
      .input(verifyDomainInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })
        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const [d] = await ctx.db
          .select({ id: workspaceDomain.id, host: workspaceDomain.host, cnameTarget: workspaceDomain.cnameTarget, txtName: workspaceDomain.txtName, txtValue: workspaceDomain.txtValue })
          .from(workspaceDomain)
          .where(eq(workspaceDomain.workspaceId, ws.id))
          .limit(1)
        if (!d) throw new HTTPException(404, { message: 'No domain configured' })

        let cnameValid = false
        let txtValid = false
        if (input.checkDns) {
          try {
            const cnames = await dnsResolver.resolveCname(d.host)
            cnameValid = cnames.includes(d.cnameTarget)
          } catch { }
          try {
            const txts = await dnsResolver.resolveTxt(d.txtName)
            txtValid = txts.some((arr) => arr.join('') === d.txtValue)
          } catch { }
        }

        const status: 'pending' | 'verified' | 'error' = cnameValid && txtValid ? 'verified' : 'pending'
        await ctx.db.update(workspaceDomain).set({ status, lastVerifiedAt: new Date(), updatedAt: new Date() }).where(eq(workspaceDomain.id, d.id))

        if (status === 'verified') {
          try {
            await ctx.db.update(workspace).set({ customDomain: d.host, updatedAt: new Date() }).where(eq(workspace.id, ws.id))
          } catch { }
          try {
            await addDomainToProject(d.host)
          } catch { }
        }

        return c.superjson({ ok: true, cnameValid, txtValid, status })
      }),

    deleteDomain: privateProcedure
      .input(checkSlugInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })
        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const [d] = await ctx.db
          .select({ host: workspaceDomain.host, id: workspaceDomain.id })
          .from(workspaceDomain)
          .where(eq(workspaceDomain.workspaceId, ws.id))
          .limit(1)

        if (d?.host) {
          try {
            await removeDomainFromProject(d.host)
          } catch { }
        }

        if (d?.id) {
          await ctx.db.delete(workspaceDomain).where(eq(workspaceDomain.id, d.id))
        } else {
          await ctx.db.delete(workspaceDomain).where(eq(workspaceDomain.workspaceId, ws.id))
        }
        await ctx.db.update(workspace).set({ customDomain: null, updatedAt: new Date() }).where(eq(workspace.id, ws.id))
        return c.superjson({ ok: true })
      }),

    updateName: privateProcedure
      .input(updateWorkspaceNameInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        let allowed = ws.ownerId === meId
        if (!allowed) {
          const [me] = await ctx.db
            .select({ id: workspaceMember.id, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
            .limit(1)
          allowed = Boolean(me) && Boolean((me as any)?.permissions?.canManageWorkspace === true)
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const name = input.name.trim()
        await ctx.db.update(workspace).set({ name, updatedAt: new Date() }).where(eq(workspace.id, ws.id))
        return c.superjson({ ok: true, name })
      }),

    updateTimezone: privateProcedure
      .input(updateTimezoneInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        let allowed = ws.ownerId === meId
        if (!allowed) {
          const [me] = await ctx.db
            .select({ id: workspaceMember.id, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
            .limit(1)
          allowed = Boolean(me) && Boolean((me as any)?.permissions?.canManageWorkspace === true)
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const timezone = input.timezone.trim()
        await ctx.db.update(workspace).set({ timezone, updatedAt: new Date() }).where(eq(workspace.id, ws.id))
        return c.superjson({ ok: true, timezone })
      }),

    delete: privateProcedure
      .input(deleteWorkspaceInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, name: workspace.name })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false, message: "Workspace not found" })

        const meId = ctx.session.user.id
        let allowed = ws.ownerId === meId
        if (!allowed) {
          const [me] = await ctx.db
            .select({ id: workspaceMember.id, role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const expectedName = String(ws.name || "").trim().toLowerCase()
        const provided = String(input.confirmName || "").trim().toLowerCase()
        if (!expectedName || provided !== expectedName) {
          throw new HTTPException(400, { message: "Workspace name does not match" })
        }

        await ctx.db.delete(workspace).where(eq(workspace.id, ws.id))
        return c.superjson({ ok: true })
      }),

    exportCsv: privateProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        // Check permissions
        const meId = ctx.session.user.id
        let allowed = ws.ownerId === meId
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        // Query all posts with board info and author
        const posts = await ctx.db
          .select({
            id: post.id,
            title: post.title,
            content: post.content,
            status: post.roadmapStatus,
            upvotes: post.upvotes,
            boardName: board.name,
            image: post.image,
            metadata: post.metadata,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            authorName: user.name,
            authorEmail: user.email,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .leftJoin(user, eq(post.authorId, user.id))
          .where(eq(board.workspaceId, ws.id))
          .orderBy(post.createdAt)

        // Build CSV
        const escapeCell = (val: string | null | undefined) => {
          if (val == null) return ""
          let str = String(val)
          if (/^[\t\r\n ]*[=+\-@]/.test(str)) {
            str = `'${str}`
          }
          str = str.replace(/"/g, '""')
          return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str
        }

        type PostRow = {
          id: string
          title: string
          content: string
          status: string | null
          upvotes: number | null
          boardName: string
          image: string | null
          metadata: { attachments?: { name: string; url: string; type: string }[] } | null
          createdAt: Date | null
          updatedAt: Date | null
          authorName: string | null
          authorEmail: string | null
        }

        const headers = ["ID", "Title", "Description", "Status", "Upvotes", "Board", "Author Name", "Author Email", "Image", "Attachments", "Created At", "Updated At"]
        const rows = posts.map((p: PostRow) => {
          const attachments = p.metadata?.attachments?.map((a) => a.url).join("; ") || ""
          return [
            escapeCell(p.id),
            escapeCell(p.title),
            escapeCell(p.content),
            escapeCell(p.status),
            String(p.upvotes || 0),
            escapeCell(p.boardName),
            escapeCell(p.authorName),
            escapeCell(p.authorEmail),
            escapeCell(p.image),
            escapeCell(attachments),
            p.createdAt ? new Date(p.createdAt).toISOString() : "",
            p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
          ]
        })

        const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n")

        c.header("Content-Type", "text/csv; charset=utf-8")
        c.header("Content-Disposition", `attachment; filename="${input.slug}-export.csv"`)
        return c.body("\uFEFF" + csv)
      }),

    importCsv: privateProcedure
      .input(importCsvInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false, importedCount: 0 })

        const meId = ctx.session.user.id
        let allowed = ws.ownerId === meId
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (me?.role === "admin" || perms?.canManageWorkspace) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const result = await runWorkspaceCsvImport({
          db: ctx.db,
          workspaceId: ws.id,
          actorUserId: ctx.session.user.id,
          csvContent: input.csvContent,
        })
        return c.json(result.summary, result.status)
      }),

    importFromCanny: privateProcedure
      .input(checkSlugInputSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerWithPlan(ctx, input.slug)
        if (!isDataImportsAllowed(String(ws.plan || "free"))) {
          throw new HTTPException(403, { message: "Canny import is available on Starter or Professional plans" })
        }

        return c.json({ ok: false, provider: "canny", message: "Canny import is coming soon" }, 501)
      }),

    importFromNolt: privateProcedure
      .input(checkSlugInputSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerWithPlan(ctx, input.slug)
        if (!isDataImportsAllowed(String(ws.plan || "free"))) {
          throw new HTTPException(403, { message: "Nolt import is available on Starter or Professional plans" })
        }

        return c.json({ ok: false, provider: "nolt", message: "Nolt import is coming soon" }, 501)
      }),

    importFromProductBoard: privateProcedure
      .input(checkSlugInputSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireWorkspaceManagerWithPlan(ctx, input.slug)
        if (!isDataImportsAllowed(String(ws.plan || "free"))) {
          throw new HTTPException(403, { message: "ProductBoard import is available on Starter or Professional plans" })
        }

        return c.json({ ok: false, provider: "productboard", message: "ProductBoard import is coming soon" }, 501)
      }),
  })
}

import { HTTPException } from "hono/http-exception"
import { and, eq, gt, isNull, sql } from "drizzle-orm"
import { j, privateProcedure } from "../jstack"
import { workspace, workspaceMember, workspaceInvite, user, brandingConfig } from "@oreilla/db"
import { sendWorkspaceInvite } from "@oreilla/auth/email"
import {
  byWorkspaceInputSchema,
  inviteMemberInputSchema,
  updateMemberRoleInputSchema,
  removeMemberInputSchema,
  listInvitesInputSchema,
  revokeInviteInputSchema,
  acceptInviteInputSchema,
  addExistingMemberInputSchema,
} from "../validators/team"
import { getPlanLimits } from "../shared/plan"
import { mapPermissions } from "../shared/permissions"

async function getWorkspaceMemberEmails(
  ctx: any,
  workspaceId: string,
  ownerId: string
): Promise<Set<string>> {
  // Get emails of existing active members
  const existingMemberEmails = await ctx.db
    .select({ email: user.email })
    .from(workspaceMember)
    .innerJoin(user, eq(workspaceMember.userId, user.id))
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.isActive, true)
      )
    )

  const memberEmails = new Set(
    existingMemberEmails
      .map((m: { email: string | null }) => m.email?.toLowerCase())
      .filter(Boolean) as string[]
  )

  // Also include owner email (owner might not be in workspaceMember table)
  const [owner] = await ctx.db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, ownerId))
    .limit(1)
  if (owner?.email) {
    memberEmails.add(owner.email.toLowerCase())
  }

  return memberEmails
}

export function createTeamRouter() {
  return j.router({
    membersByWorkspaceSlug: privateProcedure
      .input(byWorkspaceInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, name: workspace.name, slug: workspace.slug })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ members: [], invites: [] })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ id: workspaceMember.id, role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const rawMembers = await ctx.db
          .select({
            userId: workspaceMember.userId,
            role: workspaceMember.role,
            joinedAt: workspaceMember.joinedAt,
            isActive: workspaceMember.isActive,
            name: user.name,
            email: user.email,
            image: user.image,
          })
          .from(workspaceMember)
          .innerJoin(user, eq(workspaceMember.userId, user.id))
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.isActive, true)))

        const members = rawMembers.map((m: typeof rawMembers[number]) => ({ ...m, isOwner: m.userId === ws.ownerId }))

        if (!members.some((m: { userId: string }) => m.userId === ws.ownerId)) {
          const [owner] = await ctx.db
            .select({ id: user.id, name: user.name, email: user.email, image: user.image })
            .from(user)
            .where(eq(user.id, ws.ownerId))
            .limit(1)
          if (owner) {
            members.unshift({
              userId: ws.ownerId,
              role: "admin",
              joinedAt: null,
              isActive: true,
              name: owner.name,
              email: owner.email,
              image: owner.image,
              isOwner: true,
            } as {
              userId: string
              role: "admin" | "member" | "viewer"
              joinedAt: Date | null
              isActive: boolean
              name: string | null
              email: string | null
              image: string | null
              isOwner: boolean
            })
          }
        }

        const now = new Date()
        const memberEmails = await getWorkspaceMemberEmails(ctx, ws.id, ws.ownerId)

        const invites = await ctx.db
          .select({
            id: workspaceInvite.id,
            email: workspaceInvite.email,
            role: workspaceInvite.role,
            invitedBy: workspaceInvite.invitedBy,
            expiresAt: workspaceInvite.expiresAt,
            acceptedAt: workspaceInvite.acceptedAt,
            createdAt: workspaceInvite.createdAt,
          })
          .from(workspaceInvite)
          .where(and(
            eq(workspaceInvite.workspaceId, ws.id),
            gt(workspaceInvite.expiresAt, now),
            isNull(workspaceInvite.acceptedAt)
          ))
        
        // Filter out invites for emails that are already members
        const filteredInvites = invites.filter((inv: { email: string }) => !memberEmails.has(inv.email.toLowerCase()))

        c.header("Cache-Control", "private, max-age=120, stale-while-revalidate=600")
        return c.superjson({ members, invites: filteredInvites, meId })
      }),

    invite: privateProcedure
      .input(inviteMemberInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, name: workspace.name, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
        
        // Check if email already belongs to an active member
        const inviteEmail = input.email.trim().toLowerCase()
        const [existingMember] = await ctx.db
          .select({ id: workspaceMember.id })
          .from(workspaceMember)
          .innerJoin(user, eq(workspaceMember.userId, user.id))
          .where(and(
            eq(workspaceMember.workspaceId, ws.id),
            eq(workspaceMember.isActive, true),
            eq(user.email, inviteEmail)
          ))
          .limit(1)
        if (existingMember) throw new HTTPException(400, { message: "User is already a member of this workspace" })
        
        // Check if email belongs to the workspace owner
        const [owner] = await ctx.db
          .select({ email: user.email })
          .from(user)
          .where(eq(user.id, ws.ownerId))
          .limit(1)
        if (owner?.email?.toLowerCase() === inviteEmail) throw new HTTPException(400, { message: "User is already a member of this workspace" })
        
        const limits = getPlanLimits(ws.plan as "free" | "pro" | "enterprise")
        const [mc] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.isActive, true)))
          .limit(1)
        if (typeof limits.maxMembers === "number" && Number(mc?.count || 0) >= limits.maxMembers) throw new HTTPException(403, { message: "Member limit reached for current plan" })

        const token = crypto.randomUUID()
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await ctx.db.insert(workspaceInvite).values({
          workspaceId: ws.id,
          email: input.email.trim().toLowerCase(),
          role: input.role,
          invitedBy: meId,
          token,
          expiresAt: expires,
        })

        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          const url = `${baseUrl}/invite/${token}`
          const [branding] = await ctx.db
            .select({ primaryColor: brandingConfig.primaryColor })
            .from(brandingConfig)
            .where(eq(brandingConfig.workspaceId, ws.id))
            .limit(1)
          const brand = {
            name: ws.name || "oreilla",
            logoUrl: undefined,
            primaryColor: branding?.primaryColor || undefined,
            backgroundColor: undefined,
            textColor: undefined,
          }
          await sendWorkspaceInvite(input.email.trim().toLowerCase(), ws.name || "Workspace", url, brand)
        } catch {}

        return c.superjson({ ok: true, token })
      }),

    listInvites: privateProcedure
      .input(listInvitesInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ invites: [] })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const now = new Date()
        const memberEmails = await getWorkspaceMemberEmails(ctx, ws.id, ws.ownerId)

        const invites = await ctx.db
          .select({
            id: workspaceInvite.id,
            email: workspaceInvite.email,
            role: workspaceInvite.role,
            invitedBy: workspaceInvite.invitedBy,
            expiresAt: workspaceInvite.expiresAt,
            acceptedAt: workspaceInvite.acceptedAt,
            createdAt: workspaceInvite.createdAt,
          })
          .from(workspaceInvite)
          .where(and(
            eq(workspaceInvite.workspaceId, ws.id),
            gt(workspaceInvite.expiresAt, now),
            isNull(workspaceInvite.acceptedAt)
          ))
        
        // Filter out invites for emails that are already members
        const filteredInvites = invites.filter((inv: { email: string }) => !memberEmails.has(inv.email.toLowerCase()))

        return c.superjson({ invites: filteredInvites })
      }),

    revokeInvite: privateProcedure
      .input(revokeInviteInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
        const limits = getPlanLimits(ws.plan as "free" | "pro" | "enterprise")
        const [mc] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.isActive, true)))
          .limit(1)
        if (typeof limits.maxMembers === "number" && Number(mc?.count || 0) >= limits.maxMembers) throw new HTTPException(403, { message: "Member limit reached for current plan" })

        await ctx.db.delete(workspaceInvite).where(eq(workspaceInvite.id, input.inviteId))
        return c.json({ ok: true })
      }),

    updateRole: privateProcedure
      .input(updateMemberRoleInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        if (input.userId === ws.ownerId) throw new HTTPException(403, { message: "Cannot modify owner" })
        await ctx.db
          .update(workspaceMember)
          .set({ role: input.role, permissions: mapPermissions(input.role), updatedAt: new Date() })
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, input.userId)))

        return c.json({ ok: true })
      }),

    removeMember: privateProcedure
      .input(removeMemberInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const isSelf = input.userId === meId
        const allowed = isSelf || me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        if (input.userId === ws.ownerId) throw new HTTPException(403, { message: "Owner cannot leave" })
        const [u] = await ctx.db
          .select({ email: user.email })
          .from(user)
          .where(eq(user.id, input.userId))
          .limit(1)
        await ctx.db
          .delete(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, input.userId)))
        if (u?.email) {
          try {
            await ctx.db.delete(workspaceInvite).where(and(eq(workspaceInvite.workspaceId, ws.id), eq(workspaceInvite.email, u.email)))
          } catch {}
        }

        return c.json({ ok: true })
      }),

    acceptInvite: privateProcedure
      .input(acceptInviteInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [inv] = await ctx.db
          .select({ id: workspaceInvite.id, workspaceId: workspaceInvite.workspaceId, email: workspaceInvite.email, role: workspaceInvite.role, expiresAt: workspaceInvite.expiresAt, acceptedAt: workspaceInvite.acceptedAt })
          .from(workspaceInvite)
          .where(eq(workspaceInvite.token, input.token))
          .limit(1)
        if (!inv) throw new HTTPException(404, { message: "Invalid invite" })
        if (inv.acceptedAt) return c.json({ ok: false })
        if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) throw new HTTPException(410, { message: "Invite expired" })

        const me = ctx.session.user
        if (!me?.email || me.email.toLowerCase() !== inv.email.toLowerCase()) throw new HTTPException(403, { message: "Email mismatch" })

        const [existing] = await ctx.db
          .select({ id: workspaceMember.id })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, inv.workspaceId), eq(workspaceMember.userId, me.id)))
          .limit(1)
        if (!existing) {
          const [wsp] = await ctx.db
            .select({ plan: workspace.plan })
            .from(workspace)
            .where(eq(workspace.id, inv.workspaceId))
            .limit(1)
          const limits = getPlanLimits((wsp?.plan || "free") as "free" | "pro" | "enterprise")
          const [mc] = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, inv.workspaceId), eq(workspaceMember.isActive, true)))
            .limit(1)
          if (typeof limits.maxMembers === "number" && Number(mc?.count || 0) >= limits.maxMembers) throw new HTTPException(403, { message: "Member limit reached for current plan" })
          await ctx.db.insert(workspaceMember).values({
            workspaceId: inv.workspaceId,
            userId: me.id,
            role: inv.role,
            permissions: mapPermissions(inv.role),
            joinedAt: new Date(),
          })
        }

        // Delete all pending invites for this email (not just the one with the token)
        await ctx.db
          .delete(workspaceInvite)
          .where(and(
            eq(workspaceInvite.workspaceId, inv.workspaceId),
            eq(workspaceInvite.email, inv.email),
            isNull(workspaceInvite.acceptedAt)
          ))

        return c.json({ ok: true })
      }),

    declineInvite: privateProcedure
      .input(acceptInviteInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [inv] = await ctx.db
          .select({ id: workspaceInvite.id, email: workspaceInvite.email, expiresAt: workspaceInvite.expiresAt })
          .from(workspaceInvite)
          .where(eq(workspaceInvite.token, input.token))
          .limit(1)
        if (!inv) throw new HTTPException(404, { message: "Invalid invite" })
        if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) throw new HTTPException(410, { message: "Invite expired" })

        const me = ctx.session.user
        if (!me?.email || me.email.toLowerCase() !== inv.email.toLowerCase()) throw new HTTPException(403, { message: "Email mismatch" })

        await ctx.db.delete(workspaceInvite).where(eq(workspaceInvite.id, inv.id))
        return c.json({ ok: true })
      }),

    inviteByToken: privateProcedure
      .input(acceptInviteInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [inv] = await ctx.db
          .select({ id: workspaceInvite.id, workspaceId: workspaceInvite.workspaceId, email: workspaceInvite.email, role: workspaceInvite.role, expiresAt: workspaceInvite.expiresAt, acceptedAt: workspaceInvite.acceptedAt, invitedBy: workspaceInvite.invitedBy })
          .from(workspaceInvite)
          .where(eq(workspaceInvite.token, input.token))
          .limit(1)
        if (!inv) return c.superjson({ invite: null })

        const me = ctx.session.user
        if (!me?.email || me.email.toLowerCase() !== inv.email.toLowerCase()) throw new HTTPException(403, { message: "Email mismatch" })
        if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) return c.superjson({ invite: null })

        const [ws] = await ctx.db
          .select({ id: workspace.id, name: workspace.name, slug: workspace.slug, logo: workspace.logo })
          .from(workspace)
          .where(eq(workspace.id, inv.workspaceId))
          .limit(1)
        const [inviter] = await ctx.db
          .select({ name: user.name, email: user.email })
          .from(user)
          .where(inv.invitedBy ? eq(user.id, inv.invitedBy) : sql`false`)
          .limit(1)
        return c.superjson({ invite: { workspaceName: ws?.name || "Workspace", workspaceLogo: ws?.logo || null, role: inv.role, invitedByName: inviter?.name || inviter?.email || null } })
      }),

    addExisting: privateProcedure
      .input(addExistingMemberInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })

        const meId = ctx.session.user.id
        const [me] = await ctx.db
          .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
          .from(workspaceMember)
          .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, meId)))
          .limit(1)
        const allowed = me?.permissions?.canManageMembers || me?.role === "admin" || ws.ownerId === meId
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const [u] = await ctx.db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, input.email.trim().toLowerCase()))
          .limit(1)

        if (u?.id) {
          const [existing] = await ctx.db
            .select({ id: workspaceMember.id })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, u.id)))
            .limit(1)
          if (!existing) {
            await ctx.db.insert(workspaceMember).values({
              workspaceId: ws.id,
              userId: u.id,
              role: input.role,
              permissions: mapPermissions(input.role),
              joinedAt: new Date(),
            })
            // Delete any pending invites for this email since they're now a member
            await ctx.db
              .delete(workspaceInvite)
              .where(and(
                eq(workspaceInvite.workspaceId, ws.id),
                eq(workspaceInvite.email, input.email.trim().toLowerCase()),
                isNull(workspaceInvite.acceptedAt)
              ))
          }
          return c.json({ ok: true, invited: false })
        }

        const token = crypto.randomUUID()
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        await ctx.db.insert(workspaceInvite).values({
          workspaceId: ws.id,
          email: input.email.trim().toLowerCase(),
          role: input.role,
          invitedBy: meId,
          token,
          expiresAt: expires,
        })
        return c.json({ ok: true, invited: true, token })
      }),
  })
}

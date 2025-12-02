import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, board, boardModerator, user, workspaceMember } from "@feedgot/db"
import { HTTPException } from "hono/http-exception"
import { normalizePlan, getPlanLimits } from "../shared/plan"

const bySlugSchema = z.object({ slug: z.string().min(2).max(64) })

export function createChangelogRouter() {
  return j.router({
    visible: publicProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ visible: false })
        const [b] = await ctx.db
          .select({ id: board.id, isVisible: board.isVisible, isPublic: board.isPublic })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        const v = Boolean(b?.isVisible) && Boolean(b?.isPublic)
        c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=120")
        return c.superjson({ visible: v })
      }),
    settings: privateProcedure
      .input(bySlugSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ ok: false })

        const [b] = await ctx.db
          .select({ id: board.id, isVisible: board.isVisible })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)

        const moderators = await ctx.db
          .select({ userId: boardModerator.userId })
          .from(boardModerator)
          .where(b ? eq(boardModerator.boardId, b.id) : eq(boardModerator.boardId, sql`uuid_nil()`))

        const users = await Promise.all(
          moderators.map(async (m: { userId: string }) => {
            const [u] = await ctx.db
              .select({ id: user.id, name: user.name, email: user.email, image: user.image })
              .from(user)
              .where(eq(user.id, m.userId))
              .limit(1)
            return u
          }),
        )

        const tags = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color || null, count: 0 })) : []
        return c.superjson({ ok: true, isVisible: Boolean(b?.isVisible), moderators: users.filter(Boolean), tags })
      }),

    toggleVisibility: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, isVisible: z.boolean() }))
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (member?.permissions || {}) as Record<string, boolean>
          if (member?.role === "admin" || perms?.canManageBoards) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        await ctx.db.update(board).set({ isVisible: input.isVisible, updatedAt: new Date() }).where(eq(board.id, b.id))
        return c.superjson({ ok: true, isVisible: input.isVisible })
      }),

    moderatorsList: privateProcedure
        .input(bySlugSchema)
        .get(async ({ ctx, input, c }) => {
          const [ws] = await ctx.db
            .select({ id: workspace.id })
            .from(workspace)
            .where(eq(workspace.slug, input.slug))
            .limit(1)
          if (!ws) return c.superjson({ moderators: [] })

          const [b] = await ctx.db
            .select({ id: board.id })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          if (!b) return c.superjson({ moderators: [] })

          const rows = await ctx.db
            .select({ userId: boardModerator.userId })
            .from(boardModerator)
            .where(eq(boardModerator.boardId, b.id))

          const items = await Promise.all(rows.map(async (r: { userId: string }) => {
            const [u] = await ctx.db
              .select({ id: user.id, name: user.name, email: user.email, image: user.image })
              .from(user)
              .where(eq(user.id, r.userId))
              .limit(1)
            return u
          }))
          return c.superjson({ moderators: items.filter(Boolean) })
        }),

    moderatorsAdd: privateProcedure
        .input(z.object({ slug: bySlugSchema.shape.slug, userId: z.string().min(1) }))
        .post(async ({ ctx, input, c }) => {
          const [ws] = await ctx.db
            .select({ id: workspace.id, plan: workspace.plan, ownerId: workspace.ownerId })
            .from(workspace)
            .where(eq(workspace.slug, input.slug))
            .limit(1)
          if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

          let allowed = ws.ownerId === ctx.session.user.id
          if (!allowed) {
            const [member] = await ctx.db
              .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
              .from(workspaceMember)
              .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
              .limit(1)
            const perms = (member?.permissions || {}) as Record<string, boolean>
            if (member?.role === "admin" || perms?.canManageBoards) allowed = true
          }
          if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

          const planKey = normalizePlan(String(ws.plan || "free"))
          const limits = getPlanLimits(planKey)

          const [b] = await ctx.db
            .select({ id: board.id })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

          const [countRow] = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(boardModerator)
            .where(eq(boardModerator.boardId, b.id))
            .limit(1)
          const current = Number(countRow?.count || 0)
          const maxMods = limits.maxChangelogModerators
          if (typeof maxMods === "number" && current >= maxMods) {
            throw new HTTPException(403, { message: `Moderator limit reached (${maxMods})` })
          }

          await ctx.db.insert(boardModerator).values({ boardId: b.id, userId: input.userId, createdAt: new Date() })
          return c.superjson({ ok: true })
        }),

    moderatorsRemove: privateProcedure
        .input(z.object({ slug: bySlugSchema.shape.slug, userId: z.string().min(1) }))
        .post(async ({ ctx, input, c }) => {
          const [ws] = await ctx.db
            .select({ id: workspace.id, ownerId: workspace.ownerId })
            .from(workspace)
            .where(eq(workspace.slug, input.slug))
            .limit(1)
          if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

          let allowed = ws.ownerId === ctx.session.user.id
          if (!allowed) {
            const [member] = await ctx.db
              .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
              .from(workspaceMember)
              .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
              .limit(1)
            const perms = (member?.permissions || {}) as Record<string, boolean>
            if (member?.role === "admin" || perms?.canManageBoards) allowed = true
          }
          if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

          const [b] = await ctx.db
            .select({ id: board.id })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

          await ctx.db
            .delete(boardModerator)
            .where(and(eq(boardModerator.boardId, b.id), eq(boardModerator.userId, input.userId)))
          return c.superjson({ ok: true })
        }),

    tagsList: privateProcedure
        .input(bySlugSchema)
        .get(async ({ ctx, input, c }) => {
          const [ws] = await ctx.db
            .select({ id: workspace.id })
            .from(workspace)
            .where(eq(workspace.slug, input.slug))
            .limit(1)
          if (!ws) return c.superjson({ tags: [] })
          const [b] = await ctx.db
            .select({ id: board.id, changelogTags: board.changelogTags })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          const rows = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color || null, count: 0 })) : []
          return c.superjson({ tags: rows })
        }),

    tagsCreate: privateProcedure
        .input(z.object({ slug: bySlugSchema.shape.slug, name: z.string().min(1).max(64), color: z.string().optional() }))
        .post(async ({ ctx, input, c }) => {
          const [ws] = await ctx.db
            .select({ id: workspace.id, plan: workspace.plan, ownerId: workspace.ownerId })
            .from(workspace)
            .where(eq(workspace.slug, input.slug))
            .limit(1)
          if (!ws) throw new HTTPException(404, { message: "Workspace not found" })
          let allowed = ws.ownerId === ctx.session.user.id
          if (!allowed) {
            const [member] = await ctx.db
              .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
              .from(workspaceMember)
              .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
              .limit(1)
            const perms = (member?.permissions || {}) as Record<string, boolean>
            if (member?.role === "admin" || perms?.canManageBoards) allowed = true
          }
          if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
          const [b] = await ctx.db
            .select({ id: board.id, changelogTags: board.changelogTags })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          if (!b) throw new HTTPException(404, { message: "Changelog board not found" })
          const limits = getPlanLimits(String(ws.plan || "free"))
          const current = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags.length : 0
          const maxTags = limits.maxChangelogTags
          if (typeof maxTags === "number" && current >= maxTags) {
            throw new HTTPException(403, { message: `Changelog tags limit reached (${maxTags})` })
          }
          const slug = input.name.trim().toLowerCase().replace(/\s+/g, '-')
          const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
          const prev = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags : []
          const next = [...prev, { id, name: input.name.trim(), slug, color: input.color || null }]
          await ctx.db.update(board).set({ changelogTags: next, updatedAt: new Date() }).where(eq(board.id, b.id))
          return c.superjson({ ok: true })
        }),

    tagsDelete: privateProcedure
        .input(z.object({ slug: bySlugSchema.shape.slug, tagId: z.string().min(1) }))
        .post(async ({ ctx, input, c }) => {
          const [ws] = await ctx.db
            .select({ id: workspace.id, ownerId: workspace.ownerId })
            .from(workspace)
            .where(eq(workspace.slug, input.slug))
            .limit(1)
          if (!ws) throw new HTTPException(404, { message: "Workspace not found" })
          let allowed = ws.ownerId === ctx.session.user.id
          if (!allowed) {
            const [member] = await ctx.db
              .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
              .from(workspaceMember)
              .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
              .limit(1)
            const perms = (member?.permissions || {}) as Record<string, boolean>
            if (member?.role === "admin" || perms?.canManageBoards) allowed = true
          }
          if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
          const [b] = await ctx.db
            .select({ id: board.id, changelogTags: board.changelogTags })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          if (!b) throw new HTTPException(404, { message: "Changelog board not found" })
          const prev = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags : []
          const next = prev.filter((t: any) => String(t.id) !== String(input.tagId))
          await ctx.db.update(board).set({ changelogTags: next, updatedAt: new Date() }).where(eq(board.id, b.id))
          return c.superjson({ ok: true })
        }),

    entriesList: publicProcedure
        .input(z.object({ slug: bySlugSchema.shape.slug }))
        .get(async ({ ctx, input, c }) => {
          const [ws] = await ctx.db
            .select({ id: workspace.id })
            .from(workspace)
            .where(eq(workspace.slug, input.slug))
            .limit(1)
          if (!ws) return c.superjson({ entries: [] })
          const [b] = await ctx.db
            .select({ id: board.id, isVisible: board.isVisible, isPublic: board.isPublic })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          if (!b || !b.isVisible || !b.isPublic) return c.superjson({ entries: [] })
          c.header("Cache-Control", "public, max-age=15, stale-while-revalidate=60")
          return c.superjson({ entries: [] })
        }),
  })
}

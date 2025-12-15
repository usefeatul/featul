import { and, eq, sql } from "drizzle-orm"
import { z } from "zod"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, board, workspaceMember } from "@oreilla/db"
import { HTTPException } from "hono/http-exception"
import { normalizePlan, getPlanLimits, assertWithinLimit } from "../shared/plan"
import { toSlug } from "../shared/slug"
import { requireBoardManagerBySlug } from "../shared/access"

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

        const tags = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color || null, count: 0 })) : []
        return c.superjson({ ok: true, isVisible: Boolean(b?.isVisible), tags })
      }),

    toggleVisibility: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, isVisible: z.boolean() }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        await ctx.db.update(board).set({ isVisible: input.isVisible, updatedAt: new Date() }).where(eq(board.id, b.id))
        return c.superjson({ ok: true, isVisible: input.isVisible })
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
          const ws = await requireBoardManagerBySlug(ctx, input.slug)
          const [b] = await ctx.db
            .select({ id: board.id, changelogTags: board.changelogTags })
            .from(board)
            .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
            .limit(1)
          if (!b) throw new HTTPException(404, { message: "Changelog board not found" })
          const limits = getPlanLimits(String(ws.plan || "free"))
          const current = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags.length : 0
          const maxTags = limits.maxChangelogTags
          assertWithinLimit(current, maxTags, (max) => `Changelog tags limit reached (${max})`)
          const slug = toSlug(input.name)
          const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
          const prev = Array.isArray((b as any)?.changelogTags) ? (b as any).changelogTags : []
          const next = [...prev, { id, name: input.name.trim(), slug, color: input.color || null }]
          await ctx.db.update(board).set({ changelogTags: next, updatedAt: new Date() }).where(eq(board.id, b.id))
          return c.superjson({ ok: true })
        }),

    tagsDelete: privateProcedure
        .input(z.object({ slug: bySlugSchema.shape.slug, tagId: z.string().min(1) }))
        .post(async ({ ctx, input, c }) => {
          const ws = await requireBoardManagerBySlug(ctx, input.slug)
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

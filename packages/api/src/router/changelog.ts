import { and, eq, desc, sql } from "drizzle-orm"
import { z } from "zod"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, board, workspaceMember, changelogEntry } from "@oreilla/db"
import { HTTPException } from "hono/http-exception"
import { normalizePlan, getPlanLimits, assertWithinLimit } from "../shared/plan"
import { toSlug } from "../shared/slug"
import { requireBoardManagerBySlug } from "../shared/access"

const bySlugSchema = z.object({ slug: z.string().min(2).max(64) })

const entryContentSchema = z.object({
  type: z.string(),
  content: z.array(z.any()).optional(),
}).passthrough()

const createEntrySchema = z.object({
  slug: bySlugSchema.shape.slug,
  title: z.string().min(1).max(256),
  content: entryContentSchema,
  summary: z.string().max(512).optional(),
  coverImage: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
})

const updateEntrySchema = z.object({
  slug: bySlugSchema.shape.slug,
  entryId: z.string().uuid(),
  title: z.string().min(1).max(256).optional(),
  content: entryContentSchema.optional(),
  summary: z.string().max(512).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
})

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

    // Entry CRUD operations
    entriesCreate: privateProcedure
      .input(createEntrySchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)
        
        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        const limits = getPlanLimits(String(ws.plan || "free"))
        const [countResult] = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(changelogEntry)
          .where(eq(changelogEntry.boardId, b.id))
        const currentCount = countResult?.count || 0
        assertWithinLimit(currentCount, limits.maxChangelogEntries, (max) => `Changelog entries limit reached (${max})`)

        const entrySlug = toSlug(input.title) + "-" + Date.now().toString(36)
        const isPublished = input.status === "published"

        const [entry] = await ctx.db
          .insert(changelogEntry)
          .values({
            boardId: b.id,
            title: input.title.trim(),
            slug: entrySlug,
            content: input.content as Record<string, unknown>,
            summary: input.summary?.trim() || null,
            coverImage: input.coverImage || null,
            authorId: ctx.session.user.id,
            status: input.status || "draft",
            tags: input.tags || [],
            publishedAt: isPublished ? new Date() : null,
          })
          .returning()

        return c.superjson({ ok: true, entry })
      }),

    entriesUpdate: privateProcedure
      .input(updateEntrySchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)
        
        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        const [existing] = await ctx.db
          .select()
          .from(changelogEntry)
          .where(and(eq(changelogEntry.id, input.entryId), eq(changelogEntry.boardId, b.id)))
          .limit(1)
        if (!existing) throw new HTTPException(404, { message: "Changelog entry not found" })

        const updates: Partial<typeof changelogEntry.$inferInsert> = {}
        if (input.title !== undefined) updates.title = input.title.trim()
        if (input.content !== undefined) updates.content = input.content as Record<string, unknown>
        if (input.summary !== undefined) updates.summary = input.summary?.trim() || null
        if (input.coverImage !== undefined) updates.coverImage = input.coverImage || null
        if (input.tags !== undefined) updates.tags = input.tags
        if (input.status !== undefined) {
          updates.status = input.status
          if (input.status === "published" && !existing.publishedAt) {
            updates.publishedAt = new Date()
          }
        }

        const [entry] = await ctx.db
          .update(changelogEntry)
          .set(updates)
          .where(eq(changelogEntry.id, input.entryId))
          .returning()

        return c.superjson({ ok: true, entry })
      }),

    entriesGet: publicProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, entrySlug: z.string().min(1) }))
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ entry: null })

        const [b] = await ctx.db
          .select({ id: board.id, isVisible: board.isVisible, isPublic: board.isPublic, changelogTags: board.changelogTags })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b || !b.isVisible || !b.isPublic) return c.superjson({ entry: null })

        const [entry] = await ctx.db
          .select()
          .from(changelogEntry)
          .where(and(
            eq(changelogEntry.boardId, b.id),
            eq(changelogEntry.slug, input.entrySlug),
            eq(changelogEntry.status, "published")
          ))
          .limit(1)

        if (!entry) return c.superjson({ entry: null })

        const tags = (b.changelogTags as any[] || []).filter((t: any) => entry.tags.includes(t.id))

        c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
        return c.superjson({
          entry: {
            ...entry,
            tags,
          },
        })
      }),

    entriesGetForEdit: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, entryId: z.string().uuid() }))
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id, changelogTags: board.changelogTags })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        const [entry] = await ctx.db
          .select()
          .from(changelogEntry)
          .where(and(eq(changelogEntry.id, input.entryId), eq(changelogEntry.boardId, b.id)))
          .limit(1)
        if (!entry) throw new HTTPException(404, { message: "Changelog entry not found" })

        return c.superjson({ entry, availableTags: b.changelogTags || [] })
      }),

    entriesDelete: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, entryId: z.string().uuid() }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        const [existing] = await ctx.db
          .select({ id: changelogEntry.id })
          .from(changelogEntry)
          .where(and(eq(changelogEntry.id, input.entryId), eq(changelogEntry.boardId, b.id)))
          .limit(1)
        if (!existing) throw new HTTPException(404, { message: "Changelog entry not found" })

        await ctx.db.delete(changelogEntry).where(eq(changelogEntry.id, input.entryId))

        return c.superjson({ ok: true })
      }),

    entriesPublish: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, entryId: z.string().uuid() }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        const [existing] = await ctx.db
          .select()
          .from(changelogEntry)
          .where(and(eq(changelogEntry.id, input.entryId), eq(changelogEntry.boardId, b.id)))
          .limit(1)
        if (!existing) throw new HTTPException(404, { message: "Changelog entry not found" })

        const [entry] = await ctx.db
          .update(changelogEntry)
          .set({
            status: "published",
            publishedAt: existing.publishedAt || new Date(),
          })
          .where(eq(changelogEntry.id, input.entryId))
          .returning()

        return c.superjson({ ok: true, entry })
      }),

    entriesList: publicProcedure
      .input(z.object({ 
        slug: bySlugSchema.shape.slug,
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      }))
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ entries: [], total: 0 })

        const [b] = await ctx.db
          .select({ id: board.id, isVisible: board.isVisible, isPublic: board.isPublic, changelogTags: board.changelogTags })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b || !b.isVisible || !b.isPublic) return c.superjson({ entries: [], total: 0 })

        const limit = input.limit || 10
        const offset = input.offset || 0

        const [countResult] = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(changelogEntry)
          .where(and(eq(changelogEntry.boardId, b.id), eq(changelogEntry.status, "published")))

        const entries = await ctx.db
          .select()
          .from(changelogEntry)
          .where(and(eq(changelogEntry.boardId, b.id), eq(changelogEntry.status, "published")))
          .orderBy(desc(changelogEntry.publishedAt))
          .limit(limit)
          .offset(offset)

        const tagsMap = new Map((b.changelogTags as any[] || []).map((t: { id: string }) => [t.id, t]))
        const entriesWithTags = entries.map((e) => ({
          ...e,
          tags: e.tags.map((id: string) => tagsMap.get(id)).filter(Boolean),
        }))

        c.header("Cache-Control", "public, max-age=15, stale-while-revalidate=60")
        return c.superjson({ entries: entriesWithTags, total: countResult?.count || 0 })
      }),

    entriesListAll: privateProcedure
      .input(z.object({ 
        slug: bySlugSchema.shape.slug,
        status: z.enum(["draft", "published", "archived"]).optional(),
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      }))
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id, changelogTags: board.changelogTags })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        const limit = input.limit || 20
        const offset = input.offset || 0

        const whereConditions = [eq(changelogEntry.boardId, b.id)]
        if (input.status) {
          whereConditions.push(eq(changelogEntry.status, input.status))
        }

        const [countResult] = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(changelogEntry)
          .where(and(...whereConditions))

        const entries = await ctx.db
          .select()
          .from(changelogEntry)
          .where(and(...whereConditions))
          .orderBy(desc(changelogEntry.updatedAt))
          .limit(limit)
          .offset(offset)

        const tagsMap = new Map((b.changelogTags as any[] || []).map((t: { id: string }) => [t.id, t]))
        const entriesWithTags = entries.map((e) => ({
          ...e,
          tags: e.tags.map((id: string) => tagsMap.get(id)).filter(Boolean),
        }))

        return c.superjson({ entries: entriesWithTags, total: countResult?.count || 0, availableTags: b.changelogTags || [] })
      }),
  })
}

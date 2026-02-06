import { and, eq, desc, sql, getTableColumns } from "drizzle-orm"
import { z } from "zod"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, board, workspaceMember, changelogEntry, activityLog, user } from "@featul/db"
import { HTTPException } from "hono/http-exception"
import { normalizePlan, getPlanLimits, assertWithinLimit } from "../shared/plan"
import { toSlug } from "../shared/slug"
import { requireBoardManagerBySlug } from "../shared/access"
import { getChangelogTags, findTagsByIds, createTagsMap, type ChangelogTag } from "../shared/changelog-types"
import {
  bySlugSchema,
  createEntrySchema,
  updateEntrySchema,
  aiAssistSchema,
} from "../validators/changelog";
import { sendOpenRouterChat } from "../services/openrouter";

type AiAction = "prompt" | "format" | "improve" | "summary"

const AI_SYSTEM_PROMPT = [
  "You are a product changelog writing assistant.",
  "Return ONLY valid JSON. No markdown fences, no commentary.",
  "JSON keys: title, contentMarkdown, summary. Omit keys you are not asked to return.",
  "contentMarkdown must be GitHub-flavored Markdown.",
].join(" ");

function buildAiUserPrompt(input: {
  action: AiAction;
  prompt?: string;
  title?: string;
  contentMarkdown?: string;
}) {
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}` : ""
  const contentBlock = input.contentMarkdown ? `Content (Markdown):\n${input.contentMarkdown}` : ""

  switch (input.action) {
    case "prompt":
      return [
        "Write a changelog entry based on the prompt below.",
        "Requirements:",
        "- Provide a short, clear title.",
        "- Write a concise Markdown body with headings or bullets when helpful.",
        "- Provide a 1-2 sentence summary (<= 512 characters).",
        titleLine ? `Current title (if helpful): ${titleLine}` : "",
        "Prompt:",
        input.prompt || "",
      ].filter(Boolean).join("\n")
    case "format":
      return [
        "Fix formatting and structure without changing meaning.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ].filter(Boolean).join("\n\n")
    case "improve":
      return [
        "Improve clarity and concision without changing meaning.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ].filter(Boolean).join("\n\n")
    case "summary":
      return [
        "Write a concise 1-2 sentence summary (<= 512 characters).",
        "Return JSON with summary only.",
        titleLine,
        contentBlock,
      ].filter(Boolean).join("\n\n")
    default:
      return ""
  }
}

function parseAiJson(text: string) {
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1) {
    throw new HTTPException(502, { message: "AI response was not valid JSON" })
  }
  const slice = text.slice(start, end + 1)
  return JSON.parse(slice) as { contentMarkdown?: unknown; summary?: unknown; title?: unknown }
}

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
          .select({ id: board.id, isVisible: board.isVisible, changelogTags: board.changelogTags })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)

        const tags = getChangelogTags(b?.changelogTags).map(t => ({ ...t, count: 0 }))
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
        const rows = getChangelogTags(b?.changelogTags).map(t => ({ ...t, count: 0 }))
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
        const currentTags = getChangelogTags(b.changelogTags)
        const maxTags = limits.maxChangelogTags
        assertWithinLimit(currentTags.length, maxTags, (max) => `Changelog tags limit reached (${max})`)
        const slug = toSlug(input.name)
        const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const next = [...currentTags, { id, name: input.name.trim(), slug, color: input.color || null }]
        await ctx.db.update(board).set({ changelogTags: next, updatedAt: new Date() }).where(eq(board.id, b.id))

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "changelog_tag_created",
          actionType: "create",
          entity: "changelog_tag",
          entityId: String(id),
          title: input.name.trim(),
          metadata: {
            slug,
            color: input.color || null,
          },
        })

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
        const currentTags = getChangelogTags(b.changelogTags)
        const next = currentTags.filter(t => String(t.id) !== String(input.tagId))
        await ctx.db.update(board).set({ changelogTags: next, updatedAt: new Date() }).where(eq(board.id, b.id))

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "changelog_tag_deleted",
          actionType: "delete",
          entity: "changelog_tag",
          entityId: String(input.tagId),
          title: null,
          metadata: {},
        })
        return c.superjson({ ok: true })
      }),

    aiAssist: privateProcedure
      .input(aiAssistSchema)
      .post(async ({ ctx, input, c }) => {
        await requireBoardManagerBySlug(ctx, input.slug)

        const model = String(process.env.OPENROUTER_MODEL || "openrouter/auto")
        const temperatureByAction: Record<AiAction, number> = {
          prompt: 0.6,
          format: 0.2,
          improve: 0.4,
          summary: 0.2,
        }

        try {
          const result = await sendOpenRouterChat({
            model,
            messages: [
              { role: "system", content: AI_SYSTEM_PROMPT },
              { role: "user", content: buildAiUserPrompt(input) },
            ],
            temperature: temperatureByAction[input.action],
            max_tokens: 900,
            response_format: { type: "json_object" },
          })

          const message = (result as any)?.choices?.[0]?.message?.content
          if (!message || typeof message !== "string") {
            throw new HTTPException(502, { message: "AI response was empty" })
          }

          const data = parseAiJson(message)

          const contentMarkdown = typeof data.contentMarkdown === "string"
            ? data.contentMarkdown.trim()
            : undefined
          const title = typeof data.title === "string"
            ? data.title.trim().slice(0, 256)
            : undefined
          const summaryRaw = typeof data.summary === "string" ? data.summary.trim() : undefined
          const summary = summaryRaw ? summaryRaw.slice(0, 512) : undefined

          return c.superjson({ ok: true, contentMarkdown, title, summary })
        } catch (err) {
          if (err instanceof HTTPException) {
            throw err
          }
          const message = err instanceof Error ? err.message : "Failed to generate AI response"
          throw new HTTPException(500, { message })
        }
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

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "changelog_entry_created",
          actionType: "create",
          entity: "changelog_entry",
          entityId: String(entry.id),
          title: entry.title,
          metadata: {
            status: entry.status,
            tags: entry.tags,
          },
        })

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

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "changelog_entry_updated",
          actionType: "update",
          entity: "changelog_entry",
          entityId: String(entry.id),
          title: entry.title,
          metadata: {
            status: entry.status,
            tags: entry.tags,
          },
        })

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
          .select({
            ...getTableColumns(changelogEntry),
            authorName: user.name,
            authorImage: user.image,
          })
          .from(changelogEntry)
          .leftJoin(user, eq(changelogEntry.authorId, user.id))
          .where(and(
            eq(changelogEntry.boardId, b.id),
            eq(changelogEntry.slug, input.entrySlug),
            eq(changelogEntry.status, "published")
          ))
          .limit(1)

        if (!entry) return c.superjson({ entry: null })

        // Get author's role in the workspace
        let authorRole: string | null = null
        let isOwner = false
        if (entry.authorId) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role })
            .from(workspaceMember)
            .where(and(
              eq(workspaceMember.workspaceId, ws.id),
              eq(workspaceMember.userId, entry.authorId)
            ))
            .limit(1)
          authorRole = member?.role || null

          // Check if author is workspace owner
          const [wsOwner] = await ctx.db
            .select({ ownerId: workspace.ownerId })
            .from(workspace)
            .where(eq(workspace.id, ws.id))
            .limit(1)
          isOwner = wsOwner?.ownerId === entry.authorId
        }

        const allTags = getChangelogTags(b.changelogTags)
        const entryTags = findTagsByIds(allTags, entry.tags)

        c.header("Cache-Control", "public, max-age=60, stale-while-revalidate=300")
        return c.superjson({
          entry: {
            ...entry,
            author: {
              name: entry.authorName,
              image: entry.authorImage,
              role: authorRole,
              isOwner,
            },
            tags: entryTags,
          },
        })
      }),

    entriesGetForEdit: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, entryId: z.string().min(1) }))
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
      .input(z.object({ slug: bySlugSchema.shape.slug, entryId: z.string().min(1) }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Changelog board not found" })

        const [existing] = await ctx.db
          .select({ id: changelogEntry.id, title: changelogEntry.title })
          .from(changelogEntry)
          .where(and(eq(changelogEntry.id, input.entryId), eq(changelogEntry.boardId, b.id)))
          .limit(1)
        if (!existing) throw new HTTPException(404, { message: "Changelog entry not found" })

        await ctx.db.delete(changelogEntry).where(eq(changelogEntry.id, input.entryId))

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "changelog_entry_deleted",
          actionType: "delete",
          entity: "changelog_entry",
          entityId: String(input.entryId),
          title: existing.title,
          metadata: {},
        })

        return c.superjson({ ok: true })
      }),

    entriesPublish: privateProcedure
      .input(z.object({ slug: bySlugSchema.shape.slug, entryId: z.string().min(1) }))
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

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "changelog_entry_published",
          actionType: "update",
          entity: "changelog_entry",
          entityId: String(entry.id),
          title: entry.title,
          metadata: {
            status: entry.status,
          },
        })

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
          .select({
            ...getTableColumns(changelogEntry),
            authorName: user.name,
            authorImage: user.image,
          })
          .from(changelogEntry)
          .leftJoin(user, eq(changelogEntry.authorId, user.id))
          .where(and(eq(changelogEntry.boardId, b.id), eq(changelogEntry.status, "published")))
          .orderBy(desc(changelogEntry.publishedAt))
          .limit(limit)
          .offset(offset)

        // Get workspace owner
        const [wsOwner] = await ctx.db
          .select({ ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.id, ws.id))
          .limit(1)

        // Get all members for author role lookup
        type EntryWithAuthor = (typeof entries)[number]
        const authorIds = entries.map((e: EntryWithAuthor) => e.authorId).filter((id: string | null): id is string => Boolean(id))
        type MemberRole = { userId: string; role: "admin" | "member" | "viewer" | null }
        const members: MemberRole[] = authorIds.length > 0 ? await ctx.db
          .select({ userId: workspaceMember.userId, role: workspaceMember.role })
          .from(workspaceMember)
          .where(eq(workspaceMember.workspaceId, ws.id)) : []
        const memberRoleMap = new Map(members.map((m: MemberRole) => [m.userId, m.role]))

        const allTags = getChangelogTags(b.changelogTags)
        const tagsMap = createTagsMap(allTags)
        const entriesWithTags = entries.map((e: EntryWithAuthor) => ({
          ...e,
          tags: e.tags.map((id: string) => tagsMap.get(id)).filter((t: ChangelogTag | undefined): t is ChangelogTag => t !== undefined),
          author: {
            name: e.authorName,
            image: e.authorImage,
            role: e.authorId ? memberRoleMap.get(e.authorId) || null : null,
            isOwner: e.authorId ? wsOwner?.ownerId === e.authorId : false,
          },
        }))

        c.header("Cache-Control", "public, max-age=15, stale-while-revalidate=60")
        return c.superjson({ entries: entriesWithTags, total: countResult?.count || 0 })
      }),

    entriesListAll: privateProcedure
      .input(z.object({
        slug: bySlugSchema.shape.slug,
        status: z.enum(["draft", "published"]).optional(),
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

        const allTags = getChangelogTags(b.changelogTags)
        const tagsMap = createTagsMap(allTags)
        type Entry = (typeof entries)[number]
        const entriesWithTags = entries.map((e: Entry) => ({
          ...e,
          tags: e.tags.map((id: string) => tagsMap.get(id)).filter((t: ChangelogTag | undefined): t is ChangelogTag => t !== undefined),
        }))

        return c.superjson({ entries: entriesWithTags, total: countResult?.count || 0, availableTags: allTags })
      }),
  })
}

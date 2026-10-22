import { randomUUID } from "node:crypto"
import { and, eq, inArray, sql } from "drizzle-orm"
import { board, comment, db as databaseClient, post, user, workspaceMember } from "@featul/db"
import { normalizeStatus } from "../shared/status"
import { inferAttachmentName, inferAttachmentType } from "../csv/import"
import {
  normalizeBoardLookupKey,
  readImportSourceId,
  sanitizeMultilineText,
  sanitizeSingleLineText,
  toBoardSlug,
  toPostSlug,
  type WorkspaceCsvImportIssue,
  type WorkspaceCsvImportSummary,
} from "../workspace/import"
import { PROVIDER_POST_LIMIT, type ProviderComment, type ProviderImportData } from "./providers"

type PostMetadata = NonNullable<typeof post.$inferInsert["metadata"]>
type CommentMetadata = NonNullable<typeof comment.$inferInsert["metadata"]>

type BoardRow = { id: string; name: string; slug: string; sortOrder: number; isSystem: boolean }

const ISSUE_CAP = 100
const TITLE_MAX = 100
const CONTENT_MAX = 50_000
const BOARD_NAME_MAX = 64
const MAX_AUTO_BOARDS = 200
const MAX_ASSETS = 25
const INSERT_CHUNK = 200

export type ProviderImportParams = {
  db: typeof databaseClient
  workspaceId: string
  actorUserId: string
  data: ProviderImportData
}

/**
 * Upserts provider posts and comments into a workspace. Each record keeps its provider ID
 * in metadata, so running the import again updates rows instead of duplicating them.
 */
export async function runProviderImport({
  db,
  workspaceId,
  actorUserId,
  data,
}: ProviderImportParams): Promise<WorkspaceCsvImportSummary> {
  const errors: WorkspaceCsvImportIssue[] = []
  const warnings: WorkspaceCsvImportIssue[] = []
  let errorCount = 0
  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0

  const pushIssue = (kind: "error" | "warning", message: string) => {
    if (kind === "error") errorCount += 1
    const list = kind === "error" ? errors : warnings
    if (list.length < ISSUE_CAP) list.push({ row: null, message })
  }
  data.warnings.forEach((message) => pushIssue("warning", message))

  /* Boards */
  const boards: BoardRow[] = await db
    .select({ id: board.id, name: board.name, slug: board.slug, sortOrder: board.sortOrder, isSystem: board.isSystem })
    .from(board)
    .where(eq(board.workspaceId, workspaceId))

  const boardByKey = new Map<string, BoardRow>()
  const slugs = new Set<string>()
  let maxSortOrder = 0
  const registerBoard = (row: BoardRow) => {
    boardByKey.set(normalizeBoardLookupKey(row.name), row)
    boardByKey.set(normalizeBoardLookupKey(row.slug), row)
    slugs.add(row.slug)
    maxSortOrder = Math.max(maxSortOrder, row.sortOrder)
  }
  boards.forEach(registerBoard)

  let defaultBoard = boards.find((b) => b.slug === "features") || boards.find((b) => !b.isSystem) || null
  let autoCreated = 0

  const createBoard = async (rawName: string): Promise<BoardRow> => {
    const name = sanitizeSingleLineText(rawName).slice(0, BOARD_NAME_MAX) || "Imported"
    const base = toBoardSlug(name)
    let slug = base
    for (let n = 2; slugs.has(slug); n += 1) slug = `${base}-${n}`
    maxSortOrder += 1
    const [created] = await db
      .insert(board)
      .values({
        workspaceId,
        name,
        slug,
        sortOrder: maxSortOrder,
        createdBy: actorUserId,
        isSystem: false,
        isPublic: true,
        isVisible: true,
        isActive: true,
        allowAnonymous: true,
        allowComments: true,
      })
      .returning({ id: board.id, name: board.name, slug: board.slug, sortOrder: board.sortOrder, isSystem: board.isSystem })
    if (!created) throw new Error(`Failed to create board "${name}"`)
    registerBoard(created)
    autoCreated += 1
    pushIssue("warning", `Created board "${created.name}".`)
    return created
  }

  const resolveBoard = async (rawName: string | null): Promise<BoardRow> => {
    const key = rawName ? normalizeBoardLookupKey(rawName) : ""
    const existing = key ? boardByKey.get(key) : undefined
    if (existing) return existing
    if (key && autoCreated < MAX_AUTO_BOARDS) {
      const created = await createBoard(rawName!)
      defaultBoard ??= created
      return created
    }
    defaultBoard ??= await createBoard("Imported")
    return defaultBoard
  }

  /* Authors: only workspace members can be linked. Everyone else imports anonymously. */
  const members = await db
    .select({ userId: workspaceMember.userId, email: user.email })
    .from(workspaceMember)
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.isActive, true)))
  const memberIdByEmail = new Map(members.map((m) => [(m.email || "").trim().toLowerCase(), m.userId]))
  const memberFor = (email: string | null) => (email ? memberIdByEmail.get(email.trim().toLowerCase()) ?? null : null)

  /* Existing imported posts, keyed by provider ID */
  const existingPosts = await db
    .select({ id: post.id, metadata: post.metadata })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(eq(board.workspaceId, workspaceId))
  const postIdBySource = new Map<string, string>()
  const metadataByPostId = new Map<string, unknown>()
  for (const row of existingPosts) {
    const sourceId = readImportSourceId(row.metadata)
    if (sourceId) {
      postIdBySource.set(sourceId, row.id)
      metadataByPostId.set(row.id, row.metadata)
    }
  }

  /* Posts */
  const inserts: (typeof post.$inferInsert)[] = []
  for (const item of data.posts.slice(0, PROVIDER_POST_LIMIT)) {
    try {
      const title = sanitizeSingleLineText(item.title).slice(0, TITLE_MAX)
      if (!title) {
        skippedCount += 1
        continue
      }
      if (item.title.trim().length > TITLE_MAX) pushIssue("warning", `Shortened title "${title}…" to ${TITLE_MAX} characters.`)
      const content = sanitizeMultilineText(item.content).slice(0, CONTENT_MAX) || title
      const target = await resolveBoard(item.boardName)
      const assetUrls = Array.from(new Set(item.imageUrls)).filter((u) => u.length <= 2048).slice(0, MAX_ASSETS)
      const attachments = assetUrls.map((url, i) => ({ name: inferAttachmentName(url, i), url, type: inferAttachmentType(url) }))
      const authorId = memberFor(item.authorEmail)
      const fields = {
        boardId: target.id,
        title,
        content,
        roadmapStatus: normalizeStatus(item.status || "pending"),
        upvotes: item.upvotes,
        image: assetUrls[0] ?? null,
      }

      const existingId = postIdBySource.get(item.sourceId)
      if (existingId) {
        const base = asRecord(metadataByPostId.get(existingId)) as PostMetadata
        await db
          .update(post)
          .set({
            ...fields,
            metadata: { ...base, ...(attachments.length ? { attachments } : {}) },
            updatedAt: item.updatedAt ?? new Date(),
          })
          .where(eq(post.id, existingId))
        updatedCount += 1
        continue
      }

      const id = randomUUID()
      const createdAt = item.createdAt ?? new Date()
      inserts.push({
        ...fields,
        id,
        slug: toPostSlug(title),
        authorId,
        isAnonymous: !authorId,
        createdAt,
        updatedAt: item.updatedAt ?? createdAt,
        metadata: {
          ...(attachments.length ? { attachments } : {}),
          customFields: { importSourceId: item.sourceId },
        },
      })
      postIdBySource.set(item.sourceId, id)
    } catch (error) {
      skippedCount += 1
      pushIssue("error", `"${item.title.slice(0, 60)}": ${error instanceof Error ? error.message : "Failed to import post"}`)
    }
  }

  for (let i = 0; i < inserts.length; i += INSERT_CHUNK) {
    const chunk = inserts.slice(i, i + INSERT_CHUNK)
    try {
      await db.insert(post).values(chunk)
      createdCount += chunk.length
    } catch (error) {
      skippedCount += chunk.length
      for (const row of chunk) postIdBySource.delete(readImportSourceId(row.metadata) ?? "")
      pushIssue("error", `Failed to save ${chunk.length} posts: ${error instanceof Error ? error.message : "unknown error"}`)
    }
  }

  /* Comments */
  const commentResult = await importComments({ db, comments: data.comments, postIdBySource, memberFor })
  commentResult.errors.forEach((message) => pushIssue("error", message))
  if (commentResult.createdCount > 0) {
    pushIssue("warning", `Imported ${commentResult.createdCount} comments.`)
  }

  return {
    ok: true,
    importedCount: createdCount + updatedCount,
    createdCount,
    updatedCount,
    skippedCount,
    errorCount,
    errors,
    warnings,
    rowLimit: PROVIDER_POST_LIMIT,
  }
}

async function importComments({
  db,
  comments,
  postIdBySource,
  memberFor,
}: {
  db: typeof databaseClient
  comments: ProviderComment[]
  postIdBySource: Map<string, string>
  memberFor: (email: string | null) => string | null
}): Promise<{ createdCount: number; errors: string[] }> {
  const errors: string[] = []
  const relevant = comments.filter((c) => postIdBySource.has(c.postSourceId))
  if (relevant.length === 0) return { createdCount: 0, errors }

  const postIds = Array.from(new Set(relevant.map((c) => postIdBySource.get(c.postSourceId)!)))

  // Comments imported earlier are kept as they are; re-runs only add new ones.
  const commentIdBySource = new Map<string, { id: string; depth: number }>()
  for (let i = 0; i < postIds.length; i += INSERT_CHUNK) {
    const rows = await db
      .select({ id: comment.id, depth: comment.depth, metadata: comment.metadata })
      .from(comment)
      .where(inArray(comment.postId, postIds.slice(i, i + INSERT_CHUNK)))
    for (const row of rows) {
      const sourceId = asRecord(row.metadata).importSourceId
      if (typeof sourceId === "string") commentIdBySource.set(sourceId, { id: row.id, depth: row.depth ?? 0 })
    }
  }

  // Parents must be inserted before their replies.
  const bySource = new Map(relevant.map((c) => [c.sourceId, c]))
  const depthOf = (c: ProviderComment, seen = 0): number => {
    const parent = c.parentSourceId ? bySource.get(c.parentSourceId) : undefined
    return parent && seen < 20 ? depthOf(parent, seen + 1) + 1 : 0
  }
  const ordered = relevant
    .filter((c) => !commentIdBySource.has(c.sourceId))
    .map((c) => ({ c, depth: depthOf(c) }))
    .sort((a, b) => a.depth - b.depth || (a.c.createdAt?.getTime() ?? 0) - (b.c.createdAt?.getTime() ?? 0))

  const rows: (typeof comment.$inferInsert)[] = []
  const parentIds = new Set<string>()
  for (const { c } of ordered) {
    const content = sanitizeMultilineText(c.content).slice(0, CONTENT_MAX)
    if (!content) continue
    const parent = c.parentSourceId ? commentIdBySource.get(c.parentSourceId) : undefined
    const authorId = memberFor(c.authorEmail)
    const authorName = c.authorName ? sanitizeSingleLineText(c.authorName).slice(0, 100) : null
    const attachments = c.imageUrls.slice(0, MAX_ASSETS).map((url, i) => ({
      name: inferAttachmentName(url, i),
      url,
      type: inferAttachmentType(url),
    }))
    const id = randomUUID()
    const createdAt = c.createdAt ?? new Date()
    const metadata: CommentMetadata = {
      ...(attachments.length ? { attachments } : {}),
      importSourceId: c.sourceId,
    }
    rows.push({
      id,
      postId: postIdBySource.get(c.postSourceId)!,
      parentId: parent?.id ?? null,
      depth: parent ? parent.depth + 1 : 0,
      content,
      authorId,
      authorName,
      authorEmail: authorId ? null : c.authorEmail,
      isAnonymous: !authorId && !authorName,
      isInternal: c.isInternal,
      createdAt,
      updatedAt: createdAt,
      metadata,
    })
    if (parent) parentIds.add(parent.id)
    commentIdBySource.set(c.sourceId, { id, depth: parent ? parent.depth + 1 : 0 })
  }

  let createdCount = 0
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const chunk = rows.slice(i, i + INSERT_CHUNK)
    try {
      await db.insert(comment).values(chunk)
      createdCount += chunk.length
    } catch (error) {
      errors.push(`Failed to save ${chunk.length} comments: ${error instanceof Error ? error.message : "unknown error"}`)
    }
  }

  // Recount instead of incrementing so counts stay right if a chunk failed.
  for (let i = 0; i < postIds.length; i += INSERT_CHUNK) {
    const ids = postIds.slice(i, i + INSERT_CHUNK)
    await db
      .update(post)
      .set({ commentCount: sql`(select count(*)::int from comment where comment.post_id = ${post.id} and comment.status = 'published')` })
      .where(inArray(post.id, ids))
  }
  const parents = Array.from(parentIds)
  for (let i = 0; i < parents.length; i += INSERT_CHUNK) {
    await db
      .update(comment)
      .set({ replyCount: sql`(select count(*)::int from comment c2 where c2.parent_id = ${comment.id})` })
      .where(inArray(comment.id, parents.slice(i, i + INSERT_CHUNK)))
  }

  return { createdCount, errors }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

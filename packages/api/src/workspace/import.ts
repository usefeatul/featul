import { and, eq, inArray } from "drizzle-orm"
import { board, db as databaseClient, post, user, workspaceMember } from "@featul/db"
import { normalizeStatus } from "../shared/status"
import { toSlug } from "../shared/slug"
import {
  buildSmartColumnMap,
  CSV_IMPORT_ISSUE_CAP,
  CSV_IMPORT_ROW_LIMIT,
  getMappedCell,
  inferAttachmentName,
  inferAttachmentType,
  parseCsvContent,
  parseUrlList,
} from "../shared/csv-import"

export type WorkspaceCsvImportIssue = {
  row: number | null
  message: string
}

export type WorkspaceCsvImportSummary = {
  ok: boolean
  importedCount: number
  createdCount: number
  updatedCount: number
  skippedCount: number
  errorCount: number
  errors: WorkspaceCsvImportIssue[]
  warnings: WorkspaceCsvImportIssue[]
  rowLimit: number
  message?: string
}

export type WorkspaceCsvImportParams = {
  db: typeof databaseClient
  workspaceId: string
  actorUserId: string
  csvContent: string
}

export type WorkspaceCsvImportResult = {
  status: 200 | 400
  summary: WorkspaceCsvImportSummary
}

type PostMetadata = NonNullable<typeof post.$inferInsert["metadata"]>

type WorkspaceBoardRow = {
  id: string
  name: string
  slug: string
  sortOrder: number
  isSystem: boolean
}

type ExistingWorkspacePost = {
  id: string
  boardId: string
  metadata: unknown
  image: string | null
  authorId: string | null
  isAnonymous: boolean | null
  roadmapStatus: string | null
  upvotes: number | null
  createdAt: Date | null
  updatedAt: Date | null
}

const CSV_IMPORT_MAX_BYTES = 10 * 1024 * 1024
const IMPORT_POST_TITLE_MAX_LENGTH = 100
const IMPORT_POST_CONTENT_MAX_LENGTH = 50_000
const IMPORT_BOARD_NAME_MAX_LENGTH = 64
const IMPORT_AUTHOR_EMAIL_MAX_LENGTH = 254
const IMPORT_POST_ID_MAX_LENGTH = 128
const IMPORT_ASSET_URL_MAX_LENGTH = 2048
const IMPORT_MAX_ASSETS_PER_POST = 25
const IMPORT_MAX_AUTO_CREATED_BOARDS = 200
const IMPORT_UPVOTES_MAX = 2_147_483_647
const IMPORT_ID_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/
const IMPORT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

const NON_BOARD_VALUE_KEYS = new Set([
  "image",
  "images",
  "attachment",
  "attachments",
  "attachmenturl",
  "attachmenturls",
  "author",
  "authorname",
  "authoremail",
  "title",
  "description",
  "content",
  "status",
  "upvotes",
  "votes",
  "createdat",
  "updatedat",
])

function normalizeBoardLookupKey(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "")
}

function toBoardSlug(value: string): string {
  const base = toSlug(value)
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return base || "board"
}

function isSuspiciousBoardValue(value: string): boolean {
  const raw = value.trim()
  const key = normalizeBoardLookupKey(raw)
  if (!key) return true
  if (NON_BOARD_VALUE_KEYS.has(key)) return true
  if (/^https?:\/\//i.test(raw)) return true
  if (raw.includes("@")) return true
  if (raw.length > 64) return true
  return false
}

function toPostSlug(value: string): string {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const suffix = Math.random().toString(36).slice(2, 10)
  return base ? `${base}-${suffix}` : `post-${suffix}`
}

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

function sanitizeSingleLineText(value: string): string {
  return value.replace(CONTROL_CHAR_REGEX, "").trim()
}

function sanitizeMultilineText(value: string): string {
  return value.replace(CONTROL_CHAR_REGEX, "").trim()
}

function normalizeImportId(raw: string): string | null {
  const id = raw.trim()
  if (!id) return null
  if (id.length > IMPORT_POST_ID_MAX_LENGTH) return null
  if (!IMPORT_ID_REGEX.test(id)) return null
  return id
}

function normalizeAuthorEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase()
  if (!email) return null
  if (email.length > IMPORT_AUTHOR_EMAIL_MAX_LENGTH) return null
  if (!IMPORT_EMAIL_REGEX.test(email)) return null
  return email
}

function parseDateValue(raw: string): Date | null {
  const normalized = raw.trim()
  if (!normalized) return null
  const ms = Date.parse(normalized)
  if (Number.isNaN(ms)) return null
  return new Date(ms)
}

function parseUpvotesValue(raw: string): { value: number | null; clamped: boolean } {
  const normalized = raw.trim()
  if (!normalized) return { value: null, clamped: false }
  const asNumber = Number(normalized)
  if (!Number.isFinite(asNumber)) return { value: null, clamped: false }
  const asInteger = Math.floor(asNumber)
  const clamped = Math.max(0, Math.min(IMPORT_UPVOTES_MAX, asInteger))
  return { value: clamped, clamped: clamped !== asInteger }
}

function asPostMetadata(value: unknown): PostMetadata {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as PostMetadata
  }
  return {}
}

function readImportSourceId(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const customFields = (value as { customFields?: unknown }).customFields
  if (!customFields || typeof customFields !== "object" || Array.isArray(customFields)) return null
  const sourceId = (customFields as { importSourceId?: unknown }).importSourceId
  if (typeof sourceId !== "string") return null
  const trimmed = sourceId.trim()
  return trimmed || null
}

function withImportSourceId(metadata: PostMetadata | undefined, sourceId: string): PostMetadata {
  const base = asPostMetadata(metadata)
  const customFields =
    base.customFields && typeof base.customFields === "object" && !Array.isArray(base.customFields)
      ? base.customFields
      : {}
  return {
    ...base,
    customFields: {
      ...customFields,
      importSourceId: sourceId,
    },
  }
}

export async function runWorkspaceCsvImport({
  db,
  workspaceId,
  actorUserId,
  csvContent,
}: WorkspaceCsvImportParams): Promise<WorkspaceCsvImportResult> {
  const errors: WorkspaceCsvImportIssue[] = []
  const warnings: WorkspaceCsvImportIssue[] = []
  let errorCount = 0
  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0

  const pushIssue = (kind: "error" | "warning", row: number | null, message: string) => {
    if (kind === "error") {
      errorCount += 1
      if (errors.length < CSV_IMPORT_ISSUE_CAP) {
        errors.push({ row, message })
      }
      return
    }

    if (warnings.length < CSV_IMPORT_ISSUE_CAP) {
      warnings.push({ row, message })
    }
  }

  const buildSummary = (ok: boolean, message?: string): WorkspaceCsvImportSummary => ({
    ok,
    importedCount: createdCount + updatedCount,
    createdCount,
    updatedCount,
    skippedCount,
    errorCount,
    errors,
    warnings,
    rowLimit: CSV_IMPORT_ROW_LIMIT,
    message,
  })

  const csvBytes = utf8ByteLength(csvContent)
  if (csvBytes > CSV_IMPORT_MAX_BYTES) {
    const message = `CSV payload is too large. Maximum ${CSV_IMPORT_MAX_BYTES} bytes allowed.`
    pushIssue("error", null, message)
    pushIssue("warning", null, `Received ${csvBytes} bytes.`)
    return {
      status: 400,
      summary: buildSummary(false, message),
    }
  }

  let parsed: ReturnType<typeof parseCsvContent>
  try {
    parsed = parseCsvContent(csvContent)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid CSV format"
    pushIssue("error", null, message)
    return {
      status: 400,
      summary: buildSummary(false, message),
    }
  }

  if (parsed.headers.length === 0) {
    const message = "CSV is empty or missing a header row"
    pushIssue("error", null, message)
    return {
      status: 400,
      summary: buildSummary(false, message),
    }
  }

  if (parsed.rows.length > CSV_IMPORT_ROW_LIMIT) {
    const message = `CSV row limit exceeded. Maximum ${CSV_IMPORT_ROW_LIMIT} rows per import.`
    pushIssue("error", null, message)
    pushIssue("warning", null, `Received ${parsed.rows.length} rows.`)
    return {
      status: 400,
      summary: buildSummary(false, message),
    }
  }

  const columnMap = buildSmartColumnMap(parsed.headers)
  columnMap.warnings.forEach((message) => pushIssue("warning", null, message))

  if (columnMap.fieldIndex.title === undefined || columnMap.fieldIndex.content === undefined) {
    const message = "CSV must include mappable Title and Description/Content columns"
    pushIssue("error", null, message)
    return {
      status: 400,
      summary: buildSummary(false, message),
    }
  }

  const workspaceBoards: WorkspaceBoardRow[] = await db
    .select({
      id: board.id,
      name: board.name,
      slug: board.slug,
      sortOrder: board.sortOrder,
      isSystem: board.isSystem,
    })
    .from(board)
    .where(eq(board.workspaceId, workspaceId))

  const boardByLookupKey = new Map<string, WorkspaceBoardRow>()
  const boardSlugSet = new Set<string>()
  let maxSortOrder = 0

  const registerBoard = (record: WorkspaceBoardRow) => {
    const byName = normalizeBoardLookupKey(record.name)
    const bySlug = normalizeBoardLookupKey(record.slug)
    if (byName) boardByLookupKey.set(byName, record)
    if (bySlug) boardByLookupKey.set(bySlug, record)
    boardSlugSet.add(record.slug)
    if (record.sortOrder > maxSortOrder) {
      maxSortOrder = record.sortOrder
    }
  }

  for (const record of workspaceBoards) {
    registerBoard(record)
  }

  let defaultBoard =
    workspaceBoards.find((b) => b.slug === "features") ||
    workspaceBoards.find((b) => !b.isSystem) ||
    workspaceBoards[0] ||
    null
  let autoCreatedBoardCount = 0

  const createWorkspaceBoard = async (rawName: string): Promise<WorkspaceBoardRow> => {
    const safeName = sanitizeSingleLineText(rawName).slice(0, IMPORT_BOARD_NAME_MAX_LENGTH) || "Imported"
    const baseSlug = toBoardSlug(safeName)
    let nextSlug = baseSlug
    let suffix = 2
    while (boardSlugSet.has(nextSlug)) {
      nextSlug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    maxSortOrder += 1
    const createdRows = await db
      .insert(board)
      .values({
        workspaceId,
        name: safeName,
        slug: nextSlug,
        sortOrder: maxSortOrder,
        createdBy: actorUserId,
        isSystem: false,
        isPublic: true,
        isVisible: true,
        isActive: true,
        allowAnonymous: true,
        allowComments: true,
      })
      .returning({
        id: board.id,
        name: board.name,
        slug: board.slug,
        sortOrder: board.sortOrder,
        isSystem: board.isSystem,
      })

    const created = createdRows[0]
    if (!created) {
      throw new Error(`Failed to create board "${safeName}"`)
    }

    registerBoard(created)
    autoCreatedBoardCount += 1
    if (!defaultBoard) {
      defaultBoard = created
    }
    return created
  }

  const ensureDefaultBoard = async (rowNumber: number): Promise<WorkspaceBoardRow> => {
    if (defaultBoard) return defaultBoard
    const created = await createWorkspaceBoard("Imported")
    pushIssue("warning", rowNumber, `Created "${created.name}" as default board.`)
    return created
  }

  const resolveBoardForRow = async (rawBoardName: string, rowNumber: number): Promise<WorkspaceBoardRow> => {
    const boardNameSanitized = sanitizeSingleLineText(rawBoardName)
    const trimmed = boardNameSanitized.slice(0, IMPORT_BOARD_NAME_MAX_LENGTH)
    if (boardNameSanitized.length > IMPORT_BOARD_NAME_MAX_LENGTH) {
      pushIssue(
        "warning",
        rowNumber,
        `Board name exceeded ${IMPORT_BOARD_NAME_MAX_LENGTH} characters and was truncated.`
      )
    }
    if (!trimmed) {
      return ensureDefaultBoard(rowNumber)
    }

    const lookupKey = normalizeBoardLookupKey(trimmed)
    if (lookupKey) {
      const existing = boardByLookupKey.get(lookupKey)
      if (existing) return existing
    }

    if (isSuspiciousBoardValue(trimmed)) {
      const fallback = await ensureDefaultBoard(rowNumber)
      pushIssue("warning", rowNumber, `Ignored suspicious board value "${trimmed}". Used "${fallback.name}" instead.`)
      return fallback
    }

    if (autoCreatedBoardCount >= IMPORT_MAX_AUTO_CREATED_BOARDS) {
      const fallback = await ensureDefaultBoard(rowNumber)
      pushIssue(
        "warning",
        rowNumber,
        `Board auto-create limit (${IMPORT_MAX_AUTO_CREATED_BOARDS}) reached. Used "${fallback.name}" instead of "${trimmed}".`
      )
      return fallback
    }

    const created = await createWorkspaceBoard(trimmed)
    pushIssue("warning", rowNumber, `Created missing board "${created.name}".`)
    return created
  }

  const workspaceMembers = await db
    .select({
      userId: workspaceMember.userId,
      email: user.email,
    })
    .from(workspaceMember)
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .where(and(eq(workspaceMember.workspaceId, workspaceId), eq(workspaceMember.isActive, true)))

  const userIdByEmail = new Map<string, string>()
  for (const member of workspaceMembers) {
    const email = (member.email || "").trim().toLowerCase()
    if (!email) continue
    userIdByEmail.set(email, member.userId)
  }

  const idCandidates = new Set<string>()
  if (columnMap.fieldIndex.id !== undefined) {
    for (const csvRow of parsed.rows) {
      const value = getMappedCell(csvRow, columnMap.fieldIndex, "id").trim()
      const normalized = normalizeImportId(value)
      if (normalized) idCandidates.add(normalized)
    }
  }

  const existingPostsById = new Map<string, ExistingWorkspacePost>()
  const existingPostsBySourceId = new Map<string, ExistingWorkspacePost>()
  const globallyReservedIds = new Set<string>()

  if (idCandidates.size > 0) {
    const candidateList = Array.from(idCandidates)

    const existingRows = await db
      .select({
        id: post.id,
        boardId: post.boardId,
        metadata: post.metadata,
        image: post.image,
        authorId: post.authorId,
        isAnonymous: post.isAnonymous,
        roadmapStatus: post.roadmapStatus,
        upvotes: post.upvotes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(and(eq(board.workspaceId, workspaceId), inArray(post.id, candidateList)))

    for (const existing of existingRows) {
      existingPostsById.set(existing.id, existing)
    }

    const globallyExistingRows = await db
      .select({ id: post.id })
      .from(post)
      .where(inArray(post.id, candidateList))

    for (const row of globallyExistingRows) {
      globallyReservedIds.add(row.id)
    }

    const workspaceRows = await db
      .select({
        id: post.id,
        boardId: post.boardId,
        metadata: post.metadata,
        image: post.image,
        authorId: post.authorId,
        isAnonymous: post.isAnonymous,
        roadmapStatus: post.roadmapStatus,
        upvotes: post.upvotes,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(eq(board.workspaceId, workspaceId))

    for (const row of workspaceRows) {
      const sourceId = readImportSourceId(row.metadata)
      if (!sourceId) continue
      if (!idCandidates.has(sourceId)) continue
      existingPostsBySourceId.set(sourceId, row)
    }
  }

  const hasBoardColumn = columnMap.fieldIndex.board !== undefined
  const hasStatusColumn = columnMap.fieldIndex.roadmapStatus !== undefined
  const hasUpvotesColumn = columnMap.fieldIndex.upvotes !== undefined
  const hasAuthorEmailColumn = columnMap.fieldIndex.authorEmail !== undefined
  const hasCreatedAtColumn = columnMap.fieldIndex.createdAt !== undefined
  const hasUpdatedAtColumn = columnMap.fieldIndex.updatedAt !== undefined
  const hasAttachmentsColumn = columnMap.fieldIndex.attachments !== undefined
  const hasImageColumn = columnMap.fieldIndex.image !== undefined
  const hasAssetColumns = hasAttachmentsColumn || hasImageColumn

  for (let index = 0; index < parsed.rows.length; index += 1) {
    const csvRow = parsed.rows[index] || []
    const rowNumber = index + 2

    try {
      const rawTitle = getMappedCell(csvRow, columnMap.fieldIndex, "title")
      const title = sanitizeSingleLineText(rawTitle)
      let content = sanitizeMultilineText(getMappedCell(csvRow, columnMap.fieldIndex, "content"))

      if (!title) {
        skippedCount += 1
        pushIssue("error", rowNumber, "Missing required title")
        continue
      }
      if (title.length > IMPORT_POST_TITLE_MAX_LENGTH) {
        skippedCount += 1
        pushIssue("error", rowNumber, `Title exceeds max length (${IMPORT_POST_TITLE_MAX_LENGTH}).`)
        continue
      }

      if (!content) {
        content = title
        pushIssue("warning", rowNumber, "Description/body was empty. Used title as fallback content.")
      }
      if (content.length > IMPORT_POST_CONTENT_MAX_LENGTH) {
        content = content.slice(0, IMPORT_POST_CONTENT_MAX_LENGTH)
        pushIssue(
          "warning",
          rowNumber,
          `Description/body exceeded ${IMPORT_POST_CONTENT_MAX_LENGTH} characters and was truncated.`
        )
      }

      const incomingIdRaw = getMappedCell(csvRow, columnMap.fieldIndex, "id")
      const incomingId = normalizeImportId(incomingIdRaw)
      if (incomingIdRaw.trim() && !incomingId) {
        pushIssue(
          "warning",
          rowNumber,
          `Ignored invalid ID "${incomingIdRaw.trim().slice(0, 80)}". Created/updated by workspace scope only.`
        )
      }
      let existingPost = incomingId ? existingPostsById.get(incomingId) : undefined
      if (!existingPost && incomingId) {
        const bySource = existingPostsBySourceId.get(incomingId)
        if (bySource) {
          existingPost = bySource
        }
      }

      let targetBoardId: string
      if (hasBoardColumn) {
        const rawBoard = getMappedCell(csvRow, columnMap.fieldIndex, "board")
        if (rawBoard.trim()) {
          const resolved = await resolveBoardForRow(rawBoard, rowNumber)
          targetBoardId = resolved.id
        } else if (existingPost) {
          targetBoardId = existingPost.boardId
        } else {
          const fallback = await ensureDefaultBoard(rowNumber)
          targetBoardId = fallback.id
          pushIssue("warning", rowNumber, `Board was empty. Used "${fallback.name}".`)
        }
      } else if (existingPost) {
        targetBoardId = existingPost.boardId
      } else {
        const fallback = await ensureDefaultBoard(rowNumber)
        targetBoardId = fallback.id
      }

      let roadmapStatusValue: string = existingPost?.roadmapStatus || "pending"
      if (hasStatusColumn) {
        const rawStatus = getMappedCell(csvRow, columnMap.fieldIndex, "roadmapStatus")
        roadmapStatusValue = normalizeStatus(rawStatus || roadmapStatusValue || "pending")
      } else if (!existingPost) {
        roadmapStatusValue = "pending"
      }

      let upvotesValue = existingPost?.upvotes || 0
      if (hasUpvotesColumn) {
        const rawUpvotes = getMappedCell(csvRow, columnMap.fieldIndex, "upvotes")
        const parsedUpvotes = parseUpvotesValue(rawUpvotes)
        if (parsedUpvotes.value === null) {
          if (rawUpvotes.trim()) {
            pushIssue("warning", rowNumber, `Invalid upvotes "${rawUpvotes}". Using ${upvotesValue}.`)
          }
        } else {
          upvotesValue = parsedUpvotes.value
          if (parsedUpvotes.clamped) {
            pushIssue("warning", rowNumber, `Upvotes "${rawUpvotes}" exceeded limits and was clamped to ${upvotesValue}.`)
          }
        }
      } else if (!existingPost) {
        upvotesValue = 0
      }

      let authorIdValue = existingPost?.authorId || null
      let isAnonymousValue = existingPost?.isAnonymous ?? true
      if (hasAuthorEmailColumn) {
        const rawEmail = getMappedCell(csvRow, columnMap.fieldIndex, "authorEmail")
        const normalizedEmail = normalizeAuthorEmail(rawEmail)
        if (rawEmail.trim() && !normalizedEmail) {
          pushIssue("warning", rowNumber, "Invalid author email format. Imported as anonymous.")
        }
        if (normalizedEmail) {
          const matchedAuthorId = userIdByEmail.get(normalizedEmail)
          if (matchedAuthorId) {
            authorIdValue = matchedAuthorId
            isAnonymousValue = false
          } else {
            authorIdValue = null
            isAnonymousValue = true
            pushIssue(
              "warning",
              rowNumber,
              `Author email "${normalizedEmail}" was not found in workspace members. Imported as anonymous.`
            )
          }
        } else {
          authorIdValue = null
          isAnonymousValue = true
        }
      } else if (!existingPost) {
        authorIdValue = null
        isAnonymousValue = true
      }

      const rawCreatedAt = getMappedCell(csvRow, columnMap.fieldIndex, "createdAt")
      const rawUpdatedAt = getMappedCell(csvRow, columnMap.fieldIndex, "updatedAt")
      const parsedCreatedAt = hasCreatedAtColumn ? parseDateValue(rawCreatedAt) : null
      const parsedUpdatedAt = hasUpdatedAtColumn ? parseDateValue(rawUpdatedAt) : null

      if (hasCreatedAtColumn && rawCreatedAt.trim() && !parsedCreatedAt) {
        pushIssue("warning", rowNumber, `Invalid created_at value "${rawCreatedAt}".`)
      }
      if (hasUpdatedAtColumn && rawUpdatedAt.trim() && !parsedUpdatedAt) {
        pushIssue("warning", rowNumber, `Invalid updated_at value "${rawUpdatedAt}".`)
      }

      let imageValue = existingPost?.image || null
      let metadataValue: PostMetadata | undefined
      if (hasAssetColumns) {
        const rawAttachments = getMappedCell(csvRow, columnMap.fieldIndex, "attachments")
        const rawImage = getMappedCell(csvRow, columnMap.fieldIndex, "image")
        const mergedUrls = Array.from(new Set([...parseUrlList(rawAttachments), ...parseUrlList(rawImage)]))
        const validLengthUrls = mergedUrls.filter((url) => url.length <= IMPORT_ASSET_URL_MAX_LENGTH)
        if (mergedUrls.length > validLengthUrls.length) {
          pushIssue(
            "warning",
            rowNumber,
            `Ignored URLs longer than ${IMPORT_ASSET_URL_MAX_LENGTH} characters in image/attachments columns.`
          )
        }
        const urls = validLengthUrls.slice(0, IMPORT_MAX_ASSETS_PER_POST)
        if (validLengthUrls.length > IMPORT_MAX_ASSETS_PER_POST) {
          pushIssue(
            "warning",
            rowNumber,
            `Attachments exceeded ${IMPORT_MAX_ASSETS_PER_POST} URLs and were truncated.`
          )
        }
        if (urls.length === 0 && (rawAttachments.trim() || rawImage.trim())) {
          pushIssue("warning", rowNumber, "No valid URLs found in image/attachments columns.")
        }

        imageValue = urls[0] || null
        const attachments = urls.map((url, assetIndex) => ({
          name: inferAttachmentName(url, assetIndex),
          url,
          type: inferAttachmentType(url),
        }))

        if (existingPost) {
          const baseMetadata = asPostMetadata(existingPost.metadata)
          metadataValue = { ...baseMetadata, attachments }
        } else if (attachments.length > 0) {
          metadataValue = { attachments }
        } else {
          metadataValue = undefined
        }
      }

      if (!existingPost && incomingId) {
        metadataValue = withImportSourceId(metadataValue, incomingId)
      }

      if (existingPost) {
        const updatePatch: Partial<typeof post.$inferInsert> = {
          boardId: targetBoardId,
          title,
          content,
          roadmapStatus: roadmapStatusValue,
          upvotes: upvotesValue,
          updatedAt: parsedUpdatedAt || new Date(),
        }

        if (hasCreatedAtColumn && parsedCreatedAt) {
          updatePatch.createdAt = parsedCreatedAt
        }
        if (hasAuthorEmailColumn) {
          updatePatch.authorId = authorIdValue
          updatePatch.isAnonymous = isAnonymousValue
        }
        if (hasAssetColumns) {
          updatePatch.image = imageValue
          updatePatch.metadata = metadataValue
        }

        await db.update(post).set(updatePatch).where(eq(post.id, existingPost.id))

        existingPostsById.set(existingPost.id, {
          ...existingPost,
          boardId: targetBoardId,
          metadata: hasAssetColumns ? metadataValue || null : existingPost.metadata,
          image: hasAssetColumns ? imageValue : existingPost.image,
          authorId: hasAuthorEmailColumn ? authorIdValue : existingPost.authorId,
          isAnonymous: hasAuthorEmailColumn ? isAnonymousValue : existingPost.isAnonymous,
          roadmapStatus: roadmapStatusValue,
          upvotes: upvotesValue,
          createdAt: hasCreatedAtColumn ? parsedCreatedAt || existingPost.createdAt : existingPost.createdAt,
          updatedAt: parsedUpdatedAt || new Date(),
        })

        updatedCount += 1
        continue
      }

      const canReuseIncomingId = incomingId !== null && !globallyReservedIds.has(incomingId)
      if (incomingId && !canReuseIncomingId) {
        pushIssue("warning", rowNumber, `ID "${incomingId}" belongs to a different workspace. Created a new post ID instead.`)
      }

      const createdAtValue = parsedCreatedAt || new Date()
      const updatedAtValue = parsedUpdatedAt || createdAtValue
      const insertValues: typeof post.$inferInsert = {
        boardId: targetBoardId,
        title,
        content,
        slug: toPostSlug(title),
        roadmapStatus: roadmapStatusValue,
        upvotes: upvotesValue,
        authorId: authorIdValue,
        isAnonymous: isAnonymousValue,
        image: hasAssetColumns ? imageValue : null,
        createdAt: createdAtValue,
        updatedAt: updatedAtValue,
        metadata: metadataValue,
      }
      if (canReuseIncomingId && incomingId) {
        insertValues.id = incomingId
      }

      const createdRows = await db
        .insert(post)
        .values(insertValues)
        .returning({
          id: post.id,
          boardId: post.boardId,
          metadata: post.metadata,
          image: post.image,
          authorId: post.authorId,
          isAnonymous: post.isAnonymous,
          roadmapStatus: post.roadmapStatus,
          upvotes: post.upvotes,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })

      const createdPost = createdRows[0]
      if (!createdPost) {
        throw new Error(`Failed to create post for row ${rowNumber}`)
      }

      existingPostsById.set(createdPost.id, createdPost)
      globallyReservedIds.add(createdPost.id)
      if (incomingId) {
        existingPostsBySourceId.set(incomingId, createdPost)
      }
      if (incomingId && createdPost.id !== incomingId) {
        pushIssue(
          "warning",
          rowNumber,
          `Source ID "${incomingId}" was preserved as a warning only; created ID is "${createdPost.id}".`
        )
      }
      createdCount += 1
    } catch (error) {
      skippedCount += 1
      const message = error instanceof Error ? error.message : "Failed to import row"
      pushIssue("error", rowNumber, message)
    }
  }

  return {
    status: 200,
    summary: buildSummary(true),
  }
}

import { activityLog } from "@featul/db"
import { and, eq, lt, sql } from "drizzle-orm"
import {
  matchesActivityFilters,
  normalizeActivityStatus,
  readActivityStatus,
  type ActivityCategory,
} from "../shared/member-activity"

type Database = typeof import("@featul/db").db

type ActivityLogRow = {
  id: string
  type: string
  title: string | null
  entity: string
  entityId: string
  createdAt: Date | string | null
  metadata: unknown
}

export type MemberActivityPageItem = {
  id: string
  type: string
  title?: string
  entity?: string
  entityId: string
  createdAt: Date | string | null
  metadata?: unknown
  status?: string
}

export type MemberActivityPage = {
  items: MemberActivityPageItem[]
  nextCursor: string | null
}

interface LoadMemberActivityPageInput {
  database: Database
  workspaceId: string
  memberUserId: string
  cursor?: string
  limit?: number
  categoryFilter?: ActivityCategory
  statusFilter?: string
}

export async function loadMemberActivityPage({
  database,
  workspaceId,
  memberUserId,
  cursor,
  limit = 20,
  categoryFilter = "all",
  statusFilter,
}: LoadMemberActivityPageInput): Promise<MemberActivityPage> {
  const safeLimit = Math.min(Math.max(Number(limit || 20), 1), 50)
  const batchSize = Math.min(Math.max(safeLimit * 3, safeLimit + 1), 100)
  const normalizedStatusFilter = normalizeActivityStatus(statusFilter)
  let cursorDate = cursor ? new Date(cursor) : null
  const matchedRows: ActivityLogRow[] = []
  let hasMore = false

  while (matchedRows.length < safeLimit + 1) {
    const rows = await database
      .select({
        id: activityLog.id,
        type: activityLog.action,
        title: activityLog.title,
        entity: activityLog.entity,
        entityId: activityLog.entityId,
        createdAt: activityLog.createdAt,
        metadata: activityLog.metadata,
      })
      .from(activityLog)
      .where(
        and(
          eq(activityLog.workspaceId, workspaceId),
          eq(activityLog.userId, memberUserId),
          ...(cursorDate ? [lt(activityLog.createdAt, cursorDate)] : []),
        ),
      )
      .orderBy(sql`${activityLog.createdAt} desc`)
      .limit(batchSize)

    if (rows.length === 0) break

    for (const row of rows) {
      if (matchesActivityFilters(row, categoryFilter, normalizedStatusFilter ?? undefined)) {
        matchedRows.push(row)
        if (matchedRows.length >= safeLimit + 1) break
      }
    }

    if (matchedRows.length >= safeLimit + 1) {
      hasMore = true
      break
    }

    if (rows.length < batchSize) break

    const lastRowCreatedAt = rows[rows.length - 1]?.createdAt
    if (!lastRowCreatedAt) break
    cursorDate = new Date(lastRowCreatedAt)
  }

  const items = matchedRows.slice(0, safeLimit).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title ?? undefined,
    entity: row.entity || undefined,
    entityId: row.entityId,
    createdAt: row.createdAt,
    metadata: row.metadata ?? undefined,
    status: readActivityStatus(row.metadata) ?? undefined,
  }))

  const lastCreatedAt = items[items.length - 1]?.createdAt

  return {
    items,
    nextCursor:
      hasMore && lastCreatedAt ? new Date(lastCreatedAt).toISOString() : null,
  }
}

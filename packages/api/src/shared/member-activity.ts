import { ACTIVITY_ACTIONS } from "./activity-actions"

export const ACTIVITY_CATEGORIES = [
  "all",
  "posts",
  "comments",
  "changelog",
  "tags",
] as const

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]

type ActivityDescriptor = {
  entity?: string | null
  type: string
}

type ActivityMetadataCarrier = ActivityDescriptor & {
  metadata?: unknown
}

const POST_ACTION_TYPES = new Set<string>([
  ACTIVITY_ACTIONS.POST_CREATED,
  ACTIVITY_ACTIONS.POST_UPDATED,
  ACTIVITY_ACTIONS.POST_DELETED,
  ACTIVITY_ACTIONS.POST_REPORTED,
  ACTIVITY_ACTIONS.POST_VOTE_REMOVED,
  ACTIVITY_ACTIONS.POST_VOTED,
  ACTIVITY_ACTIONS.POST_MERGED,
  ACTIVITY_ACTIONS.POST_META_UPDATED,
  ACTIVITY_ACTIONS.POST_BOARD_UPDATED,
])

const COMMENT_ACTION_TYPES = new Set<string>([
  ACTIVITY_ACTIONS.COMMENT_CREATED,
  ACTIVITY_ACTIONS.COMMENT_UPDATED,
  ACTIVITY_ACTIONS.COMMENT_MARKED_INTERNAL,
  ACTIVITY_ACTIONS.COMMENT_MARKED_EXTERNAL,
  ACTIVITY_ACTIONS.COMMENT_DELETED,
  ACTIVITY_ACTIONS.COMMENT_VOTE_REMOVED,
  ACTIVITY_ACTIONS.COMMENT_VOTE_CHANGED,
  ACTIVITY_ACTIONS.COMMENT_VOTED,
  ACTIVITY_ACTIONS.COMMENT_REPORTED,
  ACTIVITY_ACTIONS.COMMENT_PINNED,
  ACTIVITY_ACTIONS.COMMENT_UNPINNED,
])

const WORKSPACE_TAG_ACTION_TYPES = new Set<string>([
  ACTIVITY_ACTIONS.TAG_CREATED,
  ACTIVITY_ACTIONS.TAG_DELETED,
])

const CHANGELOG_TAG_ACTION_TYPES = new Set<string>([
  ACTIVITY_ACTIONS.CHANGELOG_TAG_CREATED,
  ACTIVITY_ACTIONS.CHANGELOG_TAG_DELETED,
])

const CHANGELOG_ACTION_TYPES = new Set<string>([
  ACTIVITY_ACTIONS.CHANGELOG_NOTRA_CONNECTION_SAVED,
  ACTIVITY_ACTIONS.CHANGELOG_NOTRA_CONNECTION_DELETED,
  ACTIVITY_ACTIONS.CHANGELOG_NOTRA_IMPORT_FAILED,
  ACTIVITY_ACTIONS.CHANGELOG_NOTRA_IMPORTED,
  ACTIVITY_ACTIONS.CHANGELOG_ENTRY_CREATED,
  ACTIVITY_ACTIONS.CHANGELOG_ENTRY_UPDATED,
  ACTIVITY_ACTIONS.CHANGELOG_ENTRY_DELETED,
  ACTIVITY_ACTIONS.CHANGELOG_ENTRY_PUBLISHED,
])

export function normalizeActivityStatus(value: unknown): string | null {
  const raw = String(value || "").trim().toLowerCase()
  return raw.length > 0 ? raw : null
}

export function readActivityStatus(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null

  const candidate = metadata as {
    status?: unknown
    roadmapStatus?: unknown
    toStatus?: unknown
  }

  return (
    normalizeActivityStatus(candidate.status) ||
    normalizeActivityStatus(candidate.roadmapStatus) ||
    normalizeActivityStatus(candidate.toStatus)
  )
}

export function getActivityCategory(item: ActivityDescriptor): ActivityCategory {
  if (
    item.entity === "tag" ||
    item.entity === "changelog_tag" ||
    WORKSPACE_TAG_ACTION_TYPES.has(item.type) ||
    CHANGELOG_TAG_ACTION_TYPES.has(item.type)
  ) {
    return "tags"
  }

  if (item.entity === "comment" || COMMENT_ACTION_TYPES.has(item.type)) {
    return "comments"
  }

  if (item.entity === "post" || POST_ACTION_TYPES.has(item.type)) {
    return "posts"
  }

  if (item.entity === "changelog_entry" || CHANGELOG_ACTION_TYPES.has(item.type)) {
    return "changelog"
  }

  return "all"
}

export function isPostOrCommentActivity(item: ActivityDescriptor) {
  return (
    item.entity === "post" ||
    item.entity === "comment" ||
    POST_ACTION_TYPES.has(item.type) ||
    COMMENT_ACTION_TYPES.has(item.type)
  )
}

export function isChangelogActivity(item: ActivityDescriptor) {
  return (
    item.entity === "changelog_entry" ||
    item.entity === "changelog_tag" ||
    CHANGELOG_ACTION_TYPES.has(item.type) ||
    CHANGELOG_TAG_ACTION_TYPES.has(item.type)
  )
}

export function matchesActivityFilters(
  item: ActivityMetadataCarrier,
  categoryFilter: ActivityCategory,
  statusFilter?: string,
) {
  if (categoryFilter !== "all" && getActivityCategory(item) !== categoryFilter) {
    return false
  }

  if (statusFilter) {
    return readActivityStatus(item.metadata) === statusFilter
  }

  return true
}

import { format, isToday, isYesterday } from "date-fns"
import { ACTIVITY_ACTIONS } from "@featul/api/shared/activity-actions"
import { getActivityStatus } from "@/lib/activity-status"
import type { ActivityItem } from "@/types/activity"

export type ActivityCategory = "all" | "posts" | "comments" | "changelog" | "tags"

export type ActivityRow =
  | { kind: "item"; key: string; item: ActivityItem; href: string }
  | { kind: "group"; key: string; item: ActivityItem; items: ActivityItem[] }

export type ActivityDayGroup = {
  key: string
  label: string
  rows: ActivityRow[]
}

export const CATEGORY_FILTERS: Array<{ id: ActivityCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "posts", label: "Posts" },
  { id: "comments", label: "Comments" },
  { id: "changelog", label: "Changelog" },
  { id: "tags", label: "Tags" },
]

const COLLAPSIBLE_REPEAT_THRESHOLD = 3

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

export function getActivityCategory(item: ActivityItem): ActivityCategory {
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

export function getActivityHref(item: ActivityItem, workspaceSlug: string) {
  const metadata = (item.metadata ?? {}) as Record<string, unknown>
  const slugCandidate =
    (typeof metadata.slug === "string" && metadata.slug) ||
    (typeof metadata.postSlug === "string" && metadata.postSlug) ||
    null

  const isPostOrComment =
    item.entity === "post" ||
    item.entity === "comment" ||
    POST_ACTION_TYPES.has(item.type) ||
    COMMENT_ACTION_TYPES.has(item.type)

  if (isPostOrComment && slugCandidate) {
    return `/workspaces/${workspaceSlug}/requests/${slugCandidate}`
  }

  if (isPostOrComment) {
    return `/workspaces/${workspaceSlug}/requests`
  }

  const isChangelogActivity =
    item.entity === "changelog_entry" ||
    item.entity === "changelog_tag" ||
    CHANGELOG_ACTION_TYPES.has(item.type) ||
    CHANGELOG_TAG_ACTION_TYPES.has(item.type)

  if (isChangelogActivity) {
    if (item.entity === "changelog_entry" && item.entityId) {
      return `/workspaces/${workspaceSlug}/changelog/${item.entityId}/edit`
    }
    return `/workspaces/${workspaceSlug}/changelog`
  }

  return `/workspaces/${workspaceSlug}/requests`
}

export function filterActivityItems(
  items: ActivityItem[],
  categoryFilter: ActivityCategory,
  statusFilter: string,
) {
  return items.filter((item) => {
    if (categoryFilter !== "all" && getActivityCategory(item) !== categoryFilter) {
      return false
    }

    if (statusFilter !== "all") {
      return getActivityStatus(item) === statusFilter
    }

    return true
  })
}

export function getAvailableStatuses(items: ActivityItem[]) {
  const statuses = new Set<string>()
  for (const item of items) {
    const status = getActivityStatus(item)
    if (status) statuses.add(status)
  }
  return Array.from(statuses.values()).sort((a, b) => a.localeCompare(b))
}

function getActivitySignature(item: ActivityItem) {
  return [
    item.type,
    item.entity || "",
    item.entityId || "",
    item.title || "",
    getActivityStatus(item) || "",
  ].join("|")
}

function getDayKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

function getDayLabel(date: Date) {
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "MMM d, yyyy")
}

function buildRowsForDay(
  items: ActivityItem[],
  dayKey: string,
  workspaceSlug: string,
): ActivityRow[] {
  const rows: ActivityRow[] = []

  for (let i = 0; i < items.length;) {
    const current = items[i]
    if (!current) break

    const signature = getActivitySignature(current)
    let j = i + 1
    while (j < items.length) {
      const candidate = items[j]
      if (!candidate || getActivitySignature(candidate) !== signature) break
      j += 1
    }

    const groupItems = items.slice(i, j)
    if (groupItems.length >= COLLAPSIBLE_REPEAT_THRESHOLD) {
      rows.push({
        kind: "group",
        key: `${dayKey}-${i}-${signature}`,
        item: current,
        items: groupItems,
      })
    } else {
      groupItems.forEach((entry, index) => {
        rows.push({
          kind: "item",
          key: `${dayKey}-${i + index}-${entry.id}`,
          item: entry,
          href: getActivityHref(entry, workspaceSlug),
        })
      })
    }

    i = j
  }

  return rows
}

export function buildDayGroups(
  items: ActivityItem[],
  workspaceSlug: string,
): ActivityDayGroup[] {
  const byDay = new Map<string, ActivityItem[]>()

  for (const item of items) {
    const date = new Date(item.createdAt)
    const dayKey = getDayKey(date)
    const bucket = byDay.get(dayKey)
    if (bucket) bucket.push(item)
    else byDay.set(dayKey, [item])
  }

  return Array.from(byDay.entries())
    .sort(([left], [right]) => (left > right ? -1 : left < right ? 1 : 0))
    .map(([dayKey, dayItems]) => {
      const date = new Date(dayItems[0]?.createdAt || dayKey)
      return {
        key: dayKey,
        label: getDayLabel(date),
        rows: buildRowsForDay(dayItems, dayKey, workspaceSlug),
      }
    })
}

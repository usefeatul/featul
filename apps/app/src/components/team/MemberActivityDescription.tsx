import React from "react"
import { ACTIVITY_ACTIONS, type ActivityAction } from "@featul/api/shared/activity-actions"
import StatusIcon from "@/components/requests/StatusIcon"
import { formatActivityStatusLabel, getActivityStatus } from "@/lib/activity-status"
import type { ActivityItem, TagSummary } from "@/types/activity"

const TITLE_CLASS = "text-foreground font-medium min-w-0 flex-1 truncate"

type ActivityCopyConfig = {
  label: string
  showStatus?: boolean
  includeTitle?: boolean
}

const ACTIVITY_COPY: Partial<Record<ActivityAction, ActivityCopyConfig>> = {
  [ACTIVITY_ACTIONS.POST_DELETED]: { label: "deleted post" },
  [ACTIVITY_ACTIONS.POST_VOTED]: { label: "voted for" },
  [ACTIVITY_ACTIONS.POST_VOTE_REMOVED]: { label: "removed vote from" },
  [ACTIVITY_ACTIONS.POST_BOARD_UPDATED]: { label: "moved post" },
  [ACTIVITY_ACTIONS.POST_MERGED]: { label: "merged post into" },
  [ACTIVITY_ACTIONS.POST_REPORTED]: { label: "reported post" },
  [ACTIVITY_ACTIONS.COMMENT_CREATED]: { label: "added a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_UPDATED]: { label: "updated a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_DELETED]: { label: "deleted a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_VOTED]: { label: "voted on a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_VOTE_REMOVED]: { label: "removed vote from a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_VOTE_CHANGED]: { label: "changed vote on a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_MARKED_INTERNAL]: { label: "marked comment as internal on" },
  [ACTIVITY_ACTIONS.COMMENT_MARKED_EXTERNAL]: { label: "marked comment as external on" },
  [ACTIVITY_ACTIONS.COMMENT_REPORTED]: { label: "reported a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_PINNED]: { label: "pinned a comment on" },
  [ACTIVITY_ACTIONS.COMMENT_UNPINNED]: { label: "unpinned a comment on" },
  [ACTIVITY_ACTIONS.CHANGELOG_ENTRY_CREATED]: { label: "created changelog entry", showStatus: true },
  [ACTIVITY_ACTIONS.CHANGELOG_ENTRY_UPDATED]: { label: "updated changelog entry", showStatus: true },
  [ACTIVITY_ACTIONS.CHANGELOG_ENTRY_DELETED]: { label: "deleted changelog entry", showStatus: true },
  [ACTIVITY_ACTIONS.CHANGELOG_ENTRY_PUBLISHED]: { label: "published changelog entry", showStatus: true },
  [ACTIVITY_ACTIONS.CHANGELOG_NOTRA_CONNECTION_SAVED]: { label: "saved Notra connection", showStatus: true, includeTitle: false },
  [ACTIVITY_ACTIONS.CHANGELOG_NOTRA_CONNECTION_DELETED]: { label: "deleted Notra connection", showStatus: true, includeTitle: false },
  [ACTIVITY_ACTIONS.CHANGELOG_NOTRA_IMPORT_FAILED]: { label: "Notra import failed", showStatus: true, includeTitle: false },
  [ACTIVITY_ACTIONS.CHANGELOG_NOTRA_IMPORTED]: { label: "imported changelog from Notra", showStatus: true, includeTitle: false },
}

function humanizeActivityType(type: string) {
  return type.replace(/_/g, " ").trim()
}

function renderStatusWithLabel(status: unknown) {
  const label = formatActivityStatusLabel(status)
  if (!label) return null

  return (
    <span className="inline-flex items-center gap-1 shrink-0">
      <StatusIcon status={String(status)} className="size-3.5 shrink-0" />
      <span className="text-[11px] text-accent">{label}</span>
    </span>
  )
}

function renderTitledActivityRow(item: ActivityItem, status: unknown, config: ActivityCopyConfig) {
  const showStatus = config.showStatus ?? true
  const includeTitle = config.includeTitle ?? true

  return (
    <span className="flex items-center gap-2 min-w-0">
      <span>{config.label}</span>
      {showStatus ? renderStatusWithLabel(status) : null}
      {includeTitle && item.title ? <span className={TITLE_CLASS} title={item.title}>{item.title}</span> : null}
    </span>
  )
}

function renderInlineTagSummary(tags: TagSummary[]) {
  const visibleTags = tags.slice(0, 2)
  const remainingTagCount = Math.max(0, tags.length - visibleTags.length)
  if (visibleTags.length === 0) return null

  return (
    <span className="flex items-center gap-1.5 shrink-0 text-sm text-accent">
      {visibleTags.map((tag) => (
        <span
          key={String(tag.id || tag.slug || tag.name)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-muted/80 px-2 py-0.5 max-w-[120px]"
        >
          <span className="inline-block size-2 rounded-full bg-primary" />
          <span className="truncate">{tag.name || tag.slug || "tag"}</span>
        </span>
      ))}
      {remainingTagCount > 0 ? (
        <span className="text-xs text-accent shrink-0">+{remainingTagCount}</span>
      ) : null}
    </span>
  )
}

export function MemberActivityDescription({ item }: { item: ActivityItem }) {
  const status = getActivityStatus(item)
  const tags: TagSummary[] =
    (Array.isArray(item.metadata?.tags) && item.metadata?.tags) ||
    (Array.isArray(item.metadata?.tagSummaries) && item.metadata?.tagSummaries) ||
    []

  if (item.type === ACTIVITY_ACTIONS.POST_META_UPDATED) {
    const fromStatus = item.metadata?.fromStatus
    const toStatus = item.metadata?.toStatus || status

    return (
      <span className="flex items-center gap-2 min-w-0">
        <span>changed status</span>
        {fromStatus ? (
          <>
            <span>from</span>
            {renderStatusWithLabel(fromStatus)}
          </>
        ) : null}
        {toStatus ? (
          <>
            <span>to</span>
            {renderStatusWithLabel(toStatus)}
          </>
        ) : null}
        {item.title ? <span className={TITLE_CLASS} title={item.title}>{item.title}</span> : null}
      </span>
    )
  }

  if (item.type === ACTIVITY_ACTIONS.POST_UPDATED) {
    const hasTagsChange = Boolean(item.metadata?.hasTagsChange)
    const hasTagsAdded = Boolean(item.metadata?.hasTagsAdded)
    const hasTagsRemoved = Boolean(item.metadata?.hasTagsRemoved)

    let label = "updated post"
    if (hasTagsChange) {
      if (hasTagsAdded && !hasTagsRemoved) label = "added tags to"
      else if (hasTagsRemoved && !hasTagsAdded) label = "removed tags from"
      else label = "updated tags on"
    }

    return (
      <span className="flex items-center gap-2 min-w-0">
        <span>{label}</span>
        {renderStatusWithLabel(status)}
        {item.title ? <span className={TITLE_CLASS} title={item.title}>{item.title}</span> : null}
        {renderInlineTagSummary(tags)}
      </span>
    )
  }

  if (item.type === ACTIVITY_ACTIONS.POST_CREATED) {
    return (
      <span className="flex items-center gap-2 min-w-0">
        <span>created post</span>
        {renderStatusWithLabel(status)}
        {item.title ? <span className={TITLE_CLASS} title={item.title}>{item.title}</span> : null}
        {renderInlineTagSummary(tags)}
      </span>
    )
  }

  const mapped = ACTIVITY_COPY[item.type as ActivityAction]
  if (mapped) return renderTitledActivityRow(item, status, mapped)

  if (item.entity === "tag") {
    const label = item.title || item.metadata?.slug || "tag"
    const color = item.metadata?.color || null

    if (item.type === ACTIVITY_ACTIONS.TAG_CREATED) {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>created tag</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/80 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black px-2 py-0.5 text-sm">
            {color ? <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} /> : null}
            <span className="truncate max-w-[160px]">{label}</span>
          </span>
        </span>
      )
    }

    if (item.type === ACTIVITY_ACTIONS.TAG_DELETED) {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>deleted tag</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/60 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black px-2 py-0.5 text-sm">
            <span className="truncate max-w-[160px]">{label}</span>
          </span>
        </span>
      )
    }
  }

  if (item.entity === "changelog_tag") {
    const label = item.title || item.metadata?.slug || "tag"
    const color = item.metadata?.color || null

    if (item.type === ACTIVITY_ACTIONS.CHANGELOG_TAG_CREATED) {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>created changelog tag</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-muted/80 px-2 py-0.5 text-sm">
            {color ? <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} /> : null}
            <span className="truncate max-w-[160px]">{label}</span>
          </span>
        </span>
      )
    }

    if (item.type === ACTIVITY_ACTIONS.CHANGELOG_TAG_DELETED) {
      return (
        <span className="flex items-center gap-2 min-w-0">
          <span>deleted changelog tag</span>
          {label ? (
            <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-sm">
              <span className="truncate max-w-[160px]">{label}</span>
            </span>
          ) : null}
        </span>
      )
    }
  }

  return <span>{humanizeActivityType(item.type)}</span>
}

import React from "react"
import StatusIcon from "@/components/requests/StatusIcon"
import type { ActivityItem, TagSummary } from "@/types/activity"

const TITLE_CLASS = "text-foreground font-medium min-w-0 flex-1 truncate"

type ActivityCopyConfig = {
  label: string
  showStatus?: boolean
  includeTitle?: boolean
}

const ACTIVITY_COPY: Record<string, ActivityCopyConfig> = {
  post_deleted: { label: "deleted post" },
  post_voted: { label: "voted for" },
  post_vote_removed: { label: "removed vote from" },
  post_board_updated: { label: "moved post" },
  post_merged: { label: "merged post into" },
  post_reported: { label: "reported post" },
  comment_created: { label: "added a comment on" },
  comment_updated: { label: "updated a comment on" },
  comment_deleted: { label: "deleted a comment on" },
  comment_voted: { label: "voted on a comment on" },
  comment_vote_removed: { label: "removed vote from a comment on" },
  comment_vote_changed: { label: "changed vote on a comment on" },
  comment_marked_internal: { label: "marked comment as internal on" },
  comment_marked_external: { label: "marked comment as external on" },
  comment_reported: { label: "reported a comment on" },
  comment_pinned: { label: "pinned a comment on" },
  comment_unpinned: { label: "unpinned a comment on" },
  changelog_entry_created: { label: "created changelog entry", showStatus: true },
  changelog_entry_updated: { label: "updated changelog entry", showStatus: true },
  changelog_entry_deleted: { label: "deleted changelog entry", showStatus: true },
  changelog_entry_published: { label: "published changelog entry", showStatus: true },
  changelog_notra_connection_saved: { label: "saved Notra connection", showStatus: true, includeTitle: false },
  changelog_notra_connection_deleted: { label: "deleted Notra connection", showStatus: true, includeTitle: false },
  changelog_notra_import_failed: { label: "Notra import failed", showStatus: true, includeTitle: false },
  changelog_notra_imported: { label: "imported changelog from Notra", showStatus: true, includeTitle: false },
}

function humanizeActivityType(type: string) {
  return type.replace(/_/g, " ").trim()
}

function renderTitledActivityRow(item: ActivityItem, status: unknown, config: ActivityCopyConfig) {
  const showStatus = config.showStatus ?? true
  const includeTitle = config.includeTitle ?? true

  return (
    <span className="flex items-center gap-2 min-w-0">
      <span>{config.label}</span>
      {showStatus && status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
      {includeTitle && item.title ? <span className={TITLE_CLASS}>{item.title}</span> : null}
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
  const status = item.status || item.metadata?.status || item.metadata?.roadmapStatus || item.metadata?.toStatus
  const tags: TagSummary[] =
    (Array.isArray(item.metadata?.tags) && item.metadata?.tags) ||
    (Array.isArray(item.metadata?.tagSummaries) && item.metadata?.tagSummaries) ||
    []

  if (item.type === "post_meta_updated") {
    const fromStatus = item.metadata?.fromStatus
    const toStatus = item.metadata?.toStatus || status

    return (
      <span className="flex items-center gap-2 min-w-0">
        <span>changed status</span>
        {fromStatus ? (
          <>
            <span>from</span>
            <StatusIcon status={String(fromStatus)} className="size-3.5 shrink-0" />
          </>
        ) : null}
        {toStatus ? (
          <>
            <span>to</span>
            <StatusIcon status={String(toStatus)} className="size-3.5 shrink-0" />
          </>
        ) : null}
        {item.title ? <span className={TITLE_CLASS}>{item.title}</span> : null}
      </span>
    )
  }

  if (item.type === "post_updated") {
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
        {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
        {item.title ? <span className={TITLE_CLASS}>{item.title}</span> : null}
        {renderInlineTagSummary(tags)}
      </span>
    )
  }

  if (item.type === "post_created") {
    return (
      <span className="flex items-center gap-2 min-w-0">
        <span>created post</span>
        {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
        {item.title ? <span className={TITLE_CLASS}>{item.title}</span> : null}
        {renderInlineTagSummary(tags)}
      </span>
    )
  }

  const mapped = ACTIVITY_COPY[item.type]
  if (mapped) return renderTitledActivityRow(item, status, mapped)

  if (item.entity === "tag") {
    const label = item.title || item.metadata?.slug || "tag"
    const color = item.metadata?.color || null

    if (item.type === "tag_created") {
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

    if (item.type === "tag_deleted") {
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

    if (item.type === "changelog_tag_created") {
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

    if (item.type === "changelog_tag_deleted") {
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

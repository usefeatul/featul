"use client"

import React from "react"
import { format } from "date-fns"
import StatusIcon from "@/components/requests/StatusIcon"
import { Button } from "@featul/ui/components/button"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import type { ActivityItem, TagSummary } from "@/types/activity"

interface MemberActivityProps {
  items: ActivityItem[]
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
  isLoading?: boolean
}

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
  changelog_entry_created: { label: "created changelog entry", showStatus: false },
  changelog_entry_updated: { label: "updated changelog entry", showStatus: false },
  changelog_entry_deleted: { label: "deleted changelog entry", showStatus: false },
  changelog_entry_published: { label: "published changelog entry", showStatus: false },
  changelog_notra_connection_saved: { label: "saved Notra connection", showStatus: false, includeTitle: false },
  changelog_notra_connection_deleted: { label: "deleted Notra connection", showStatus: false, includeTitle: false },
  changelog_notra_import_failed: { label: "Notra import failed", showStatus: false, includeTitle: false },
  changelog_notra_imported: { label: "imported changelog from Notra", showStatus: false, includeTitle: false },
}

function humanizeActivityType(type: string) {
  return type.replace(/_/g, " ").trim()
}

function renderTitledActivityRow(it: ActivityItem, status: unknown, config: ActivityCopyConfig) {
  const showStatus = config.showStatus ?? true
  const includeTitle = config.includeTitle ?? true

  return (
    <span className="flex items-center gap-2 min-w-0">
      <span>{config.label}</span>
      {showStatus && status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
      {includeTitle && it.title ? <span className={TITLE_CLASS}>{it.title}</span> : null}
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

function renderActivityDescription(it: ActivityItem) {
  const status = it.status || it.metadata?.status || it.metadata?.roadmapStatus || it.metadata?.toStatus
  const tags: TagSummary[] =
    (Array.isArray(it.metadata?.tags) && it.metadata?.tags) ||
    (Array.isArray(it.metadata?.tagSummaries) && it.metadata?.tagSummaries) ||
    []

  if (it.type === "post_meta_updated") {
    const fromStatus = it.metadata?.fromStatus
    const toStatus = it.metadata?.toStatus || status
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
        {it.title ? <span className={TITLE_CLASS}>{it.title}</span> : null}
      </span>
    )
  }

  if (it.type === "post_updated") {
    const hasTagsChange = Boolean(it.metadata?.hasTagsChange)
    const hasTagsAdded = Boolean(it.metadata?.hasTagsAdded)
    const hasTagsRemoved = Boolean(it.metadata?.hasTagsRemoved)
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
        {it.title ? <span className={TITLE_CLASS}>{it.title}</span> : null}
        {renderInlineTagSummary(tags)}
      </span>
    )
  }

  if (it.type === "post_created") {
    return (
      <span className="flex items-center gap-2 min-w-0">
        <span>created post</span>
        {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
        {it.title ? <span className={TITLE_CLASS}>{it.title}</span> : null}
        {renderInlineTagSummary(tags)}
      </span>
    )
  }

  const mapped = ACTIVITY_COPY[it.type]
  if (mapped) {
    return renderTitledActivityRow(it, status, mapped)
  }

  if (it.entity === "tag") {
    const label = it.title || it.metadata?.slug || "tag"
    const color = it.metadata?.color || null
    if (it.type === "tag_created") {
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
    if (it.type === "tag_deleted") {
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

  if (it.entity === "changelog_tag") {
    const label = it.title || it.metadata?.slug || "tag"
    const color = it.metadata?.color || null
    if (it.type === "changelog_tag_created") {
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
    if (it.type === "changelog_tag_deleted") {
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

  return <span>{humanizeActivityType(it.type)}</span>
}

export function MemberActivity({ items, hasNextPage, isFetchingNextPage, onLoadMore, isLoading }: MemberActivityProps) {
  return (
    <div className="lg:col-span-2 lg:pr-4 lg:border-r lg:border-border/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Activity</div>
      </div>
      <ul className="divide-y divide-border">
        {isLoading && items.length === 0 ? (
          <li className="py-6">
            <LoadingSpinner label="Loading activity..." />
          </li>
        ) : items.length === 0 ? (
          <li className="py-6 text-accent text-sm text-center">No activity yet</li>
        ) : (
          items.map((it) => (
            <li key={`${it.type}-${it.id}-${String(it.createdAt)}`} className="py-3">
              <div className="text-xs text-accent flex items-center gap-2 min-w-0">
                <span className="font-medium shrink-0">
                  {format(new Date(it.createdAt), "LLL d")}
                </span>
                <span className="min-w-0 flex-1">
                  {renderActivityDescription(it)}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
      {hasNextPage ? (
        <div className="pt-3 mt-1 border-t flex justify-center">
          <Button variant="nav" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

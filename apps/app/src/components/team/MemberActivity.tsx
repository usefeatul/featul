"use client"

import React from "react"
import Link from "next/link"
import { format, isToday, isYesterday } from "date-fns"
import { Button } from "@featul/ui/components/button"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { MemberActivityDescription } from "@/components/team/MemberActivityDescription"
import type { ActivityItem } from "@/types/activity"

type ActivityCategory = "all" | "posts" | "comments" | "changelog" | "tags"

type ActivityRow =
  | { kind: "item"; key: string; item: ActivityItem; href: string }
  | { kind: "group"; key: string; item: ActivityItem; items: ActivityItem[] }

type ActivityDayGroup = {
  key: string
  label: string
  rows: ActivityRow[]
}

const CATEGORY_FILTERS: Array<{ id: ActivityCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "posts", label: "Posts" },
  { id: "comments", label: "Comments" },
  { id: "changelog", label: "Changelog" },
  { id: "tags", label: "Tags" },
]

const COLLAPSIBLE_REPEAT_THRESHOLD = 3

interface MemberActivityProps {
  workspaceSlug: string
  items: ActivityItem[]
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
  isLoading?: boolean
}

function getActivityStatus(item: ActivityItem): string | null {
  const raw = item.status || item.metadata?.status || item.metadata?.roadmapStatus || item.metadata?.toStatus
  if (!raw) return null
  const value = String(raw).trim().toLowerCase()
  return value.length > 0 ? value : null
}

function formatStatusLabel(status: string) {
  if (status === "progress") return "Progress"
  if (status === "review") return "Review"
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getActivityCategory(item: ActivityItem): ActivityCategory {
  if (item.entity === "post" || item.type.startsWith("post_")) return "posts"
  if (item.entity === "comment" || item.type.startsWith("comment_")) return "comments"
  if (item.entity === "tag" || item.entity === "changelog_tag") return "tags"
  if (item.entity === "changelog_entry" || item.type.startsWith("changelog_")) return "changelog"
  return "all"
}

function getActivityHref(item: ActivityItem, workspaceSlug: string) {
  const metadata = (item.metadata ?? {}) as Record<string, unknown>
  const slugCandidate =
    (typeof metadata.slug === "string" && metadata.slug) ||
    (typeof metadata.postSlug === "string" && metadata.postSlug) ||
    null

  const isPostOrComment =
    item.entity === "post" ||
    item.entity === "comment" ||
    item.type.startsWith("post_") ||
    item.type.startsWith("comment_")

  if (isPostOrComment && slugCandidate) {
    return `/workspaces/${workspaceSlug}/requests/${slugCandidate}`
  }

  if (isPostOrComment) {
    return `/workspaces/${workspaceSlug}/requests`
  }

  if (item.entity === "changelog_entry" || item.type.startsWith("changelog_")) {
    if (item.entityId) {
      return `/workspaces/${workspaceSlug}/changelog/${item.entityId}/edit`
    }
    return `/workspaces/${workspaceSlug}/changelog`
  }

  return `/workspaces/${workspaceSlug}/requests`
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

function buildRowsForDay(items: ActivityItem[], dayKey: string, workspaceSlug: string): ActivityRow[] {
  const rows: ActivityRow[] = []

  for (let i = 0; i < items.length; ) {
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

function buildDayGroups(items: ActivityItem[], workspaceSlug: string): ActivityDayGroup[] {
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

function chipClass(active: boolean) {
  return `rounded-md h-7 px-3 text-xs border transition-colors ${
    active
      ? "border-primary/30 bg-primary/10 text-foreground"
      : "border-border text-accent hover:bg-muted"
  }`
}

export function MemberActivity({ workspaceSlug, items, hasNextPage, isFetchingNextPage, onLoadMore, isLoading }: MemberActivityProps) {
  const [categoryFilter, setCategoryFilter] = React.useState<ActivityCategory>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({})

  const availableStatuses = React.useMemo(() => {
    const statuses = new Set<string>()
    items.forEach((item) => {
      const status = getActivityStatus(item)
      if (status) statuses.add(status)
    })
    return Array.from(statuses.values()).sort((a, b) => a.localeCompare(b))
  }, [items])

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "all" && getActivityCategory(item) !== categoryFilter) {
        return false
      }
      if (statusFilter !== "all") {
        return getActivityStatus(item) === statusFilter
      }
      return true
    })
  }, [items, categoryFilter, statusFilter])

  const dayGroups = React.useMemo(() => {
    return buildDayGroups(filteredItems, workspaceSlug)
  }, [filteredItems, workspaceSlug])

  const toggleGroup = React.useCallback((key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const renderActivityItem = React.useCallback((item: ActivityItem, key: string, href: string) => {
    return (
      <li key={key} className="py-0">
        <Link
          href={href}
          className="block -mx-2 rounded-sm px-2 py-2.5 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="text-xs text-accent flex items-center gap-2 min-w-0">
            <span className="font-medium shrink-0">{format(new Date(item.createdAt), "LLL d")}</span>
            <span className="min-w-0 flex-1">
              <MemberActivityDescription item={item} />
            </span>
          </div>
        </Link>
      </li>
    )
  }, [])

  return (
    <div className="lg:pr-4 lg:border-r lg:border-border/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Activity</div>
      </div>

      <div className="mb-3 space-y-2 rounded-md border border-border/60 bg-background p-2.5">
        <div className="space-y-1.5">
          <div className="px-0.5 text-[11px] uppercase tracking-wide text-accent/80">Type</div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="inline-flex min-w-max gap-1.5 pr-1">
              {CATEGORY_FILTERS.map((filter) => (
                <Button
                  key={filter.id}
                  type="button"
                  variant="plain"
                  size="xs"
                  className={chipClass(categoryFilter === filter.id)}
                  onClick={() => setCategoryFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {availableStatuses.length > 0 ? (
          <div className="space-y-1.5">
            <div className="px-0.5 text-[11px] uppercase tracking-wide text-accent/80">Status</div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="inline-flex min-w-max gap-1.5 pr-1">
                <Button
                  type="button"
                  variant="plain"
                  size="xs"
                  className={chipClass(statusFilter === "all")}
                  onClick={() => setStatusFilter("all")}
                >
                  All statuses
                </Button>
                {availableStatuses.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant="plain"
                    size="xs"
                    className={chipClass(statusFilter === status)}
                    onClick={() => setStatusFilter(status)}
                  >
                    {formatStatusLabel(status)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {isLoading && items.length === 0 ? (
        <div className="py-6">
          <LoadingSpinner label="Loading activity..." />
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="py-6 text-accent text-sm text-center">No matching activity</div>
      ) : (
        <div className="space-y-4">
          {dayGroups.map((day) => (
            <section key={day.key} className="space-y-1.5">
              <div className="px-1 text-[11px] uppercase tracking-wide text-accent/90 font-medium">{day.label}</div>
              <ul className="divide-y divide-border">
                {day.rows.map((row) => {
                  if (row.kind === "item") {
                    return renderActivityItem(row.item, row.key, row.href)
                  }

                  const isExpanded = Boolean(expandedGroups[row.key])
                  if (isExpanded) {
                    return (
                      <React.Fragment key={row.key}>
                        {row.items.map((entry, index) =>
                          renderActivityItem(
                            entry,
                            `${row.key}-entry-${entry.id}-${index}`,
                            getActivityHref(entry, workspaceSlug),
                          ),
                        )}
                        <li className="py-1.5">
                          <button
                            type="button"
                            onClick={() => toggleGroup(row.key)}
                            className="text-xs text-accent hover:text-foreground"
                          >
                            Show less
                          </button>
                        </li>
                      </React.Fragment>
                    )
                  }

                  return (
                    <li key={row.key} className="py-0">
                      <button
                        type="button"
                        onClick={() => toggleGroup(row.key)}
                        className="w-full text-left block -mx-2 rounded-sm px-2 py-2.5 hover:bg-muted/60"
                      >
                        <div className="text-xs text-accent flex items-center gap-2 min-w-0">
                          <span className="font-medium shrink-0">{format(new Date(row.item.createdAt), "LLL d")}</span>
                          <span className="min-w-0 flex-1">
                            <MemberActivityDescription item={row.item} />
                          </span>
                          <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-accent shrink-0">
                            {row.items.length}x
                          </span>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

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

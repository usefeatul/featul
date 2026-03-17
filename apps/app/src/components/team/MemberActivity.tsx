"use client"

import React from "react"
import { format } from "date-fns"
import { Button } from "@featul/ui/components/button"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { MemberActivityFilters } from "@/components/team/MemberActivityFilters"
import { MemberActivityDescription } from "@/components/team/MemberActivityDescription"
import { MemberActivityItemRow } from "@/components/team/MemberActivityItemRow"
import { getActivityHref } from "@/components/team/member-activity-utils"
import { useMemberActivityFilters } from "@/components/team/useMemberActivityFilters"
import type { ActivityItem } from "@/types/activity"

interface MemberActivityProps {
  workspaceSlug: string
  items: ActivityItem[]
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
  isLoading?: boolean
}

export function MemberActivity({ workspaceSlug, items, hasNextPage, isFetchingNextPage, onLoadMore, isLoading }: MemberActivityProps) {
  const {
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    availableStatuses,
    dayGroups,
    expandedGroups,
    toggleGroup,
  } = useMemberActivityFilters({
    items,
    workspaceSlug,
  })

  return (
    <div className="lg:pr-4 lg:border-r lg:border-border/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Activity</div>
      </div>

      <MemberActivityFilters
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        availableStatuses={availableStatuses}
        onCategoryChange={setCategoryFilter}
        onStatusChange={setStatusFilter}
      />

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
                    return <MemberActivityItemRow key={row.key} item={row.item} href={row.href} />
                  }

                  const isExpanded = Boolean(expandedGroups[row.key])
                  if (isExpanded) {
                    return (
                      <React.Fragment key={row.key}>
                        {row.items.map((entry, index) => (
                          <MemberActivityItemRow
                            key={`${row.key}-entry-${entry.id}-${index}`}
                            item={entry}
                            href={getActivityHref(entry, workspaceSlug)}
                          />
                        ))}
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

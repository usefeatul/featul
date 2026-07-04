"use client"

import { Button } from "@featul/ui/components/button"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { MemberActivityDaySection } from "@/components/team/MemberActivityDaySection"
import { MemberActivityFilters } from "@/components/team/MemberActivityFilters"
import type { ActivityCategory } from "@/components/team/member-activity-utils"
import { useMemberActivityFilters } from "@/components/team/useMemberActivityFilters"
import type { ActivityItem } from "@/types/activity"

interface MemberActivityProps {
  workspaceSlug: string
  items: ActivityItem[]
  hasNextPage: boolean | undefined
  isFetchingNextPage: boolean
  onLoadMore: () => void
  isLoading?: boolean
  categoryFilter: ActivityCategory
  onCategoryChange: (category: ActivityCategory) => void
  statusFilter: string
  onStatusChange: (status: string) => void
}

export function MemberActivity({
  workspaceSlug,
  items,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  isLoading,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
}: MemberActivityProps) {
  const { availableStatuses, dayGroups, expandedGroups, toggleGroup } =
    useMemberActivityFilters({
      items,
      workspaceSlug,
      categoryFilter,
      statusFilter,
    })

  const hasVisibleActivity = dayGroups.length > 0
  const shouldShowLoadMore = Boolean(hasNextPage && hasVisibleActivity)

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-foreground">Activity</div>
          <p className="mt-1 text-xs text-accent">
            Filter contributions by the kind of work you want to review.
          </p>
        </div>
      </div>

      <MemberActivityFilters
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        availableStatuses={availableStatuses}
        onCategoryChange={onCategoryChange}
        onStatusChange={onStatusChange}
      />

      {isLoading && items.length === 0 ? (
        <div className="py-8">
          <LoadingSpinner label="Loading activity..." />
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/70 bg-card/40 py-8 text-center text-xs text-accent">
          No matching activity
        </div>
      ) : (
        <div className="space-y-6">
          {dayGroups.map((day) => (
            <MemberActivityDaySection
              key={day.key}
              dayGroup={day}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </div>
      )}

      {shouldShowLoadMore ? (
        <div className="mt-6 flex justify-center border-t border-border/70 pt-4">
          <Button
            variant="nav"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

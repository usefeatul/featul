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
  const {
    availableStatuses,
    dayGroups,
    expandedGroups,
    toggleGroup,
  } = useMemberActivityFilters({
    items,
    workspaceSlug,
    categoryFilter,
    statusFilter,
  })

  const hasVisibleActivity = dayGroups.length > 0
  const shouldShowLoadMore = Boolean(hasNextPage && hasVisibleActivity)

  return (
    <div className="lg:pr-4 lg:border-r lg:border-border/60">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Activity</div>
      </div>

      <MemberActivityFilters
        categoryFilter={categoryFilter}
        statusFilter={statusFilter}
        availableStatuses={availableStatuses}
        onCategoryChange={onCategoryChange}
        onStatusChange={onStatusChange}
      />

      {isLoading && items.length === 0 ? (
        <div className="py-6">
          <LoadingSpinner label="Loading activity..." />
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="py-6 text-accent text-sm text-center">No matching activity</div>
      ) : (
        <div>
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
        <div className="pt-3 mt-1 border-t flex justify-center">
          <Button variant="nav" onClick={onLoadMore} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

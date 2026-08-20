"use client"

import { Button } from "@featul/ui/components/button"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { MemberActivityDaySection } from "@/components/team/MemberActivityDaySection"
import { MemberActivityFilters } from "@/components/team/MemberActivityFilters"
import type { ActivityCategory } from "@/components/team/activity/utils"
import { useMemberActivityFilters } from "@/components/team/useMemberActivityFilters"
import type { ActivityItem } from "@/types/activity"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"
import { cn } from "@featul/ui/lib/utils"

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
    <section className={cn(settingsCardShellClass, "w-full min-w-0")}>
      <header className="flex items-center py-2">
        <h2 className="mt-0.5 text-sm font-medium leading-none text-foreground">
          Activity
        </h2>
      </header>
      <div className={cn(settingsCardInnerClass, "min-w-0")}>
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
          <div className="py-6 text-center text-sm text-accent">No matching activity</div>
        ) : (
          <div className="min-w-0 w-full">
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
          <div className="mt-3 flex justify-center border-t border-border/60 pt-3 dark:border-white/10">
            <Button
              variant="plain"
              className="dark:border-white/10 dark:bg-black"
              onClick={onLoadMore}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : "Load more"}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

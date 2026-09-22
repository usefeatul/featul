"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { formatActivityStatusLabel } from "@/lib/activity/status"
import {
  CATEGORY_FILTERS,
  type ActivityCategory,
} from "@/components/team/activity/utils"
import { cn } from "@featul/ui/lib/utils"

interface MemberActivityFiltersProps {
  categoryFilter: ActivityCategory
  statusFilter: string
  availableStatuses: string[]
  onCategoryChange: (category: ActivityCategory) => void
  onStatusChange: (status: string) => void
}

function chipClass(active: boolean) {
  return cn(
    "h-7 rounded-md border-0 bg-muted/55 px-3 text-xs shadow-none ring-0 dark:bg-white/[0.045]",
    active
      ? "text-foreground ring-1 ring-primary/35"
      : "text-accent hover:bg-muted hover:text-foreground dark:hover:bg-white/[0.075]",
  )
}

const rowClass =
  "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

export function MemberActivityFilters({
  categoryFilter,
  statusFilter,
  availableStatuses,
  onCategoryChange,
  onStatusChange,
}: MemberActivityFiltersProps) {
  return (
    <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
      <div className="min-w-0 space-y-2">
        <div className="px-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-accent/80">Type</div>
        <div className={rowClass}>
          <div className="inline-flex min-w-max gap-1.5 pr-1">
            {CATEGORY_FILTERS.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                variant="card"
                size="xs"
                className={chipClass(categoryFilter === filter.id)}
                onClick={() => onCategoryChange(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {availableStatuses.length > 0 ? (
        <div className="min-w-0 space-y-2">
          <div className="px-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-accent/80">Status</div>
          <div className={rowClass}>
            <div className="inline-flex min-w-max gap-1.5 pr-1">
              <Button
                type="button"
                variant="card"
                size="xs"
                className={chipClass(statusFilter === "all")}
                onClick={() => onStatusChange("all")}
              >
                All statuses
              </Button>
              {availableStatuses.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant="card"
                  size="xs"
                  className={chipClass(statusFilter === status)}
                  onClick={() => onStatusChange(status)}
                >
                  {formatActivityStatusLabel(status) || status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

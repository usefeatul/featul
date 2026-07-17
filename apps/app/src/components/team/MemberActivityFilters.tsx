"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { formatActivityStatusLabel } from "@/lib/activity-status"
import {
  CATEGORY_FILTERS,
  type ActivityCategory,
} from "@/components/team/member-activity-utils"

interface MemberActivityFiltersProps {
  categoryFilter: ActivityCategory
  statusFilter: string
  availableStatuses: string[]
  onCategoryChange: (category: ActivityCategory) => void
  onStatusChange: (status: string) => void
}

function chipClass(active: boolean) {
  return `rounded-md h-7 px-3 text-xs border bg-background transition-colors ${
    active
      ? "border-primary/40 text-foreground ring-1 ring-primary/20"
      : "border-border text-accent hover:border-foreground/20"
  }`
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
    <div className="mb-3 space-y-2 rounded-md border border-border/60 bg-background p-2.5">
      <div className="space-y-1.5">
        <div className="px-0.5 text-[11px] uppercase tracking-wide text-accent/80">Type</div>
        <div className={rowClass}>
          <div className="inline-flex min-w-max gap-1.5 pr-1">
            {CATEGORY_FILTERS.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                variant="plain"
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
        <div className="space-y-1.5">
          <div className="px-0.5 text-[11px] uppercase tracking-wide text-accent/80">Status</div>
          <div className={rowClass}>
            <div className="inline-flex min-w-max gap-1.5 pr-1">
              <Button
                type="button"
                variant="plain"
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
                  variant="plain"
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

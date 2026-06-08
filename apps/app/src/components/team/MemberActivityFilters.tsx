"use client"

import React from "react"
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
    <div className="mb-6 space-y-4">
      <div className={rowClass}>
        <div className="inline-flex min-w-max gap-5 border-b border-border/70 pr-1">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`border-b-2 px-0 pb-3 text-xs font-medium transition-colors ${
                categoryFilter === filter.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-accent hover:text-foreground"
              }`}
              onClick={() => onCategoryChange(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {availableStatuses.length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Status
          </div>
          <div className={rowClass}>
            <div className="inline-flex min-w-max gap-2 pr-1">
              <button
                type="button"
                className={`h-6 rounded-md border px-2.5 text-xs transition-colors ${
                  statusFilter === "all"
                    ? "border-primary/40 bg-card text-foreground ring-1 ring-primary/20"
                    : "border-border/70 bg-card/50 text-accent hover:text-foreground"
                }`}
                onClick={() => onStatusChange("all")}
              >
                All
              </button>
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`h-6 rounded-md border px-2.5 text-xs transition-colors ${
                    statusFilter === status
                      ? "border-primary/40 bg-card text-foreground ring-1 ring-primary/20"
                      : "border-border/70 bg-card/50 text-accent hover:text-foreground"
                  }`}
                  onClick={() => onStatusChange(status)}
                >
                  {formatActivityStatusLabel(status) || status}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

"use client"

import React from "react"
import type { ActivityItem } from "@/types/activity"
import {
  buildDayGroups,
  filterActivityItems,
  getAvailableStatuses,
  type ActivityCategory,
} from "@/components/team/member-activity-utils"

interface UseMemberActivityFiltersInput {
  items: ActivityItem[]
  workspaceSlug: string
  categoryFilter: ActivityCategory
  statusFilter: string
}

export function useMemberActivityFilters({
  items,
  workspaceSlug,
  categoryFilter,
  statusFilter,
}: UseMemberActivityFiltersInput) {
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({})

  const categoryScopedItems = React.useMemo(() => {
    return filterActivityItems(items, categoryFilter, "all")
  }, [items, categoryFilter])

  const availableStatuses = React.useMemo(() => {
    const statuses = getAvailableStatuses(categoryScopedItems)
    if (statusFilter === "all" || statuses.includes(statusFilter)) {
      return statuses
    }
    return [...statuses, statusFilter].sort((left, right) => left.localeCompare(right))
  }, [categoryScopedItems, statusFilter])

  const filteredItems = React.useMemo(() => {
    return filterActivityItems(items, categoryFilter, statusFilter)
  }, [items, categoryFilter, statusFilter])

  const dayGroups = React.useMemo(() => {
    return buildDayGroups(filteredItems, workspaceSlug)
  }, [filteredItems, workspaceSlug])

  React.useEffect(() => {
    setExpandedGroups({})
  }, [categoryFilter, statusFilter])

  const toggleGroup = React.useCallback((key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return {
    categoryFilter,
    statusFilter,
    availableStatuses,
    dayGroups,
    expandedGroups,
    toggleGroup,
  }
}

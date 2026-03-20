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
  const [statusOptions, setStatusOptions] = React.useState<string[]>([])

  const categoryScopedItems = React.useMemo(() => {
    return filterActivityItems(items, categoryFilter, "all")
  }, [items, categoryFilter])

  const availableStatuses = React.useMemo(() => {
    if (statusFilter === "all") return getAvailableStatuses(categoryScopedItems)
    return statusOptions.length > 0 ? statusOptions : getAvailableStatuses(categoryScopedItems)
  }, [categoryScopedItems, statusFilter, statusOptions])

  const filteredItems = React.useMemo(() => {
    return filterActivityItems(items, categoryFilter, statusFilter)
  }, [items, categoryFilter, statusFilter])

  const dayGroups = React.useMemo(() => {
    return buildDayGroups(filteredItems, workspaceSlug)
  }, [filteredItems, workspaceSlug])

  React.useEffect(() => {
    setExpandedGroups({})
  }, [categoryFilter, statusFilter])

  React.useEffect(() => {
    if (statusFilter === "all") {
      setStatusOptions(getAvailableStatuses(categoryScopedItems))
    }
  }, [categoryScopedItems, statusFilter])

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

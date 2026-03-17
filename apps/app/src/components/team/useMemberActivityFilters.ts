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
}

export function useMemberActivityFilters({
  items,
  workspaceSlug,
}: UseMemberActivityFiltersInput) {
  const [categoryFilter, setCategoryFilter] = React.useState<ActivityCategory>("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({})

  const availableStatuses = React.useMemo(() => {
    return getAvailableStatuses(items)
  }, [items])

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
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    availableStatuses,
    dayGroups,
    expandedGroups,
    toggleGroup,
  }
}

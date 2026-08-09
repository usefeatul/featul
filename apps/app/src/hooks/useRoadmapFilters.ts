"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { groupItemsByStatus, sortRoadmapItems } from "@/lib/roadmap";
import { parseRoadmapFiltersFromSearchParams } from "@/utils/roadmap/url";
import type { RequestItemData } from "@/types/request";

export function useRoadmapFilters(items: RequestItemData[]) {
  const searchParams = useSearchParams();
  const filters = React.useMemo(
    () => parseRoadmapFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const grouped = React.useMemo(() => {
    const byStatus = groupItemsByStatus(items);
    const next: Record<string, RequestItemData[]> = {};
    for (const [status, statusItems] of Object.entries(byStatus)) {
      next[status] = sortRoadmapItems(statusItems, filters.order);
    }
    return next;
  }, [filters.order, items]);

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.board.length > 0 ||
    filters.tag.length > 0 ||
    filters.order !== "newest";

  const totalVisible = React.useMemo(
    () => Object.values(grouped).reduce((sum, columnItems) => sum + columnItems.length, 0),
    [grouped],
  );

  return {
    filters,
    grouped,
    hasActiveFilters,
    totalVisible,
    totalItems: items.length,
  };
}

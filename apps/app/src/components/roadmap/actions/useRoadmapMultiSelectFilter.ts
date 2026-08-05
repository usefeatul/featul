"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useFilterPopover } from "@/lib/filter-store";
import { getSlugFromPath } from "@/config/nav";
import {
  buildRoadmapUrl,
  parseRoadmapFiltersFromSearchParams,
} from "@/utils/roadmap-url";
import {
  isAllSelected as isAllSel,
  toggleValue,
} from "@/utils/request";

type RoadmapFilterKey = "board" | "tag";

export function useRoadmapMultiSelectFilter({
  filterKey,
  popoverKey,
  values,
}: {
  filterKey: RoadmapFilterKey;
  popoverKey: string;
  values: string[];
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const [open, setOpen] = useFilterPopover(popoverKey);
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);

  const selected = React.useMemo(
    () => parseRoadmapFiltersFromSearchParams(searchParams)[filterKey],
    [filterKey, searchParams],
  );
  const isAllSelected = React.useMemo(
    () => isAllSel(values, selected),
    [selected, values],
  );

  const updateSelection = React.useCallback(
    (next: string[]) => {
      const href = buildRoadmapUrl(slug, searchParams, {
        [filterKey]: next,
      } as Partial<{ board: string[]; tag: string[] }>);

      React.startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [filterKey, router, searchParams, slug],
  );

  const toggle = React.useCallback(
    (value: string) => {
      updateSelection(toggleValue(selected, value));
    },
    [selected, updateSelection],
  );

  const selectAll = React.useCallback(() => {
    updateSelection(isAllSelected ? [] : values);
  }, [isAllSelected, updateSelection, values]);

  return {
    open,
    setOpen,
    selected,
    isAllSelected,
    toggle,
    selectAll,
  };
}

"use client";

import React from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { getSlugFromPath, requestsBase } from "@/config/nav";
import { buildRequestsUrl } from "@/utils/request";
import { useFilterBarVisibility } from "@/hooks/useFilterBarVisibility";
import { useRequestFilterLabels } from "@/hooks/useRequestFilterLabels";
import { parseRequestFiltersFromSearchParams } from "@/utils/request/filters";
import {
  buildRoadmapUrl,
  parseRoadmapFiltersFromSearchParams,
} from "@/utils/roadmap/url";
import { getRequestStatusLabel } from "@/constants/request/filters";
import { SORT_OPTIONS } from "@/types/sort";

export type ActiveFilterItem = {
  key: string;
  label: string;
  onRemove: () => void;
};

function countOtherFilters({
  statusCount,
  boardCount,
  tagCount,
  hasSort,
  hasSearch,
  exclude,
}: {
  statusCount: number;
  boardCount: number;
  tagCount: number;
  hasSort: boolean;
  hasSearch: boolean;
  exclude: "status" | "board" | "tag" | "sort" | "search";
}) {
  return (
    (exclude === "status" ? 0 : statusCount) +
    (exclude === "board" ? 0 : boardCount) +
    (exclude === "tag" ? 0 : tagCount) +
    (exclude === "sort" ? 0 : hasSort ? 1 : 0) +
    (exclude === "search" ? 0 : hasSearch ? 1 : 0)
  );
}

export function useActivePageFilters() {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const router = useRouter();
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);
  const isRoadmapPage = pathname.includes("/roadmap");
  const isRequestsPage =
    pathname.includes("/requests") ||
    pathname === `/workspaces/${slug}` ||
    pathname === `/workspaces/${slug}/`;

  const requestFilters = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp),
    [sp],
  );
  const roadmapFilters = React.useMemo(
    () => parseRoadmapFiltersFromSearchParams(sp),
    [sp],
  );

  const status = isRoadmapPage ? [] : requestFilters.status;
  const boards = isRoadmapPage ? roadmapFilters.board : requestFilters.board;
  const tags = isRoadmapPage ? roadmapFilters.tag : requestFilters.tag;
  const order = isRoadmapPage ? roadmapFilters.order : requestFilters.order;
  const search = isRoadmapPage ? roadmapFilters.search : requestFilters.search;
  const hasSort = order !== "newest";

  const count =
    status.length +
    boards.length +
    tags.length +
    (hasSort ? 1 : 0) +
    (search ? 1 : 0);
  const hasAnyFilters = count > 0;
  const isVisible = hasAnyFilters && (isRoadmapPage || isRequestsPage);

  const { handleClearAll } = useFilterBarVisibility({
    hasAnyFilters,
    buildClearAllHref: () =>
      isRoadmapPage ? `/workspaces/${slug}/roadmap` : requestsBase(slug),
  });

  const { boardsBySlug, tagsBySlug } = useRequestFilterLabels(slug);

  const pushFilterUrl = React.useCallback(
    (
      overrides: Partial<{
        status: string[];
        board: string[];
        tag: string[];
        order: string;
        search: string;
      }>,
    ) => {
      const href = isRoadmapPage
        ? buildRoadmapUrl(slug, sp, overrides)
        : buildRequestsUrl(slug, sp, overrides);
      React.startTransition(() => router.push(href, { scroll: false }));
    },
    [isRoadmapPage, router, slug, sp],
  );

  const removeListValue = React.useCallback(
    (
      key: "status" | "board" | "tag",
      current: string[],
      value: string,
    ) => {
      const next = current.filter((item) => item !== value);
      const others = countOtherFilters({
        statusCount: status.length,
        boardCount: boards.length,
        tagCount: tags.length,
        hasSort,
        hasSearch: Boolean(search),
        exclude: key,
      });

      if (next.length === 0 && others === 0) {
        handleClearAll();
        return;
      }

      pushFilterUrl({ [key]: next });
    },
    [
      boards.length,
      handleClearAll,
      hasSort,
      pushFilterUrl,
      search,
      status.length,
      tags.length,
    ],
  );

  const items = React.useMemo((): ActiveFilterItem[] => {
    const list: ActiveFilterItem[] = [];

    if (search) {
      list.push({
        key: "search",
        label: search,
        onRemove: () => {
          const others = countOtherFilters({
            statusCount: status.length,
            boardCount: boards.length,
            tagCount: tags.length,
            hasSort,
            hasSearch: false,
            exclude: "search",
          });
          if (others === 0) {
            handleClearAll();
            return;
          }
          pushFilterUrl({ search: "" });
        },
      });
    }

    for (const value of status) {
      list.push({
        key: `status-${value}`,
        label: getRequestStatusLabel(value),
        onRemove: () => removeListValue("status", status, value),
      });
    }

    for (const value of boards) {
      list.push({
        key: `board-${value}`,
        label: boardsBySlug[value] || value,
        onRemove: () => removeListValue("board", boards, value),
      });
    }

    for (const value of tags) {
      list.push({
        key: `tag-${value}`,
        label: tagsBySlug[value] || value,
        onRemove: () => removeListValue("tag", tags, value),
      });
    }

    if (hasSort) {
      list.push({
        key: `order-${order}`,
        label:
          SORT_OPTIONS.find((option) => option.value === order)?.label ||
          order,
        onRemove: () => {
          const others = countOtherFilters({
            statusCount: status.length,
            boardCount: boards.length,
            tagCount: tags.length,
            hasSort: false,
            hasSearch: Boolean(search),
            exclude: "sort",
          });
          if (others === 0) {
            handleClearAll();
            return;
          }
          pushFilterUrl({ order: "newest" });
        },
      });
    }

    return list;
  }, [
    boards,
    boardsBySlug,
    handleClearAll,
    hasSort,
    order,
    pushFilterUrl,
    removeListValue,
    search,
    status,
    tags,
    tagsBySlug,
  ]);

  const preview = items
    .slice(0, 2)
    .map((item) => item.label)
    .join(" · ");

  return {
    isVisible,
    count,
    items,
    preview,
    handleClearAll,
  };
}

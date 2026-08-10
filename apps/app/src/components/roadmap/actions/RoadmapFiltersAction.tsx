"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { Button } from "@featul/ui/components/button";
import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { LayersIcon } from "@featul/ui/icons/layers";
import { TagIcon } from "@featul/ui/icons/tag";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { client } from "@featul/api/client";
import { getSlugFromPath } from "@/config/nav";
import { filterToolbarButtonClass } from "@/utils/filter/toolbar";
import { parseRoadmapFiltersFromSearchParams } from "@/utils/roadmap/url";
import { useFilterPopover } from "@/lib/filter/store";
import { RequestMultiSelectFilterList } from "@/components/requests/actions/MultiSelectFilter";
import { useRoadmapMultiSelectFilter } from "./useRoadmapMultiSelectFilter";

type FilterView = "root" | "boards" | "tags";

type BoardItem = {
  id: string;
  name: string;
  slug: string;
};

type TagItem = {
  id: string;
  name: string;
  slug: string;
};

function MenuTrailing({ count }: { count: number }) {
  return (
    <span className="ml-auto flex items-center gap-1.5">
      {count > 0 ? (
        <span className="text-xs tabular-nums text-accent">{count}</span>
      ) : null}
      <ChevronRightIcon className="size-3.5 shrink-0 text-accent" size={14} />
    </span>
  );
}

export default function RoadmapFiltersAction({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);
  const [open, setOpen] = useFilterPopover("roadmap-filters");
  const [view, setView] = React.useState<FilterView>("root");

  const filters = React.useMemo(
    () => parseRoadmapFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const { data: boards = [], isLoading: boardsLoading } = useQuery({
    queryKey: ["boards", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug });
      const data = (await res.json().catch(() => null)) as {
        boards?: Array<{ id?: string; name?: string; slug?: string }>;
      } | null;
      return (Array.isArray(data?.boards) ? data.boards : [])
        .filter(
          (board): board is BoardItem =>
            typeof board?.id === "string" &&
            typeof board?.name === "string" &&
            typeof board?.slug === "string" &&
            board.slug !== "roadmap" &&
            board.slug !== "changelog",
        )
        .map((board) => ({
          id: board.id,
          name: board.name,
          slug: board.slug,
        }));
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["tags", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
      const data = (await res.json().catch(() => null)) as {
        tags?: Array<{ id?: string; name?: string; slug?: string }>;
      } | null;
      return (Array.isArray(data?.tags) ? data.tags : [])
        .filter(
          (tag): tag is TagItem =>
            typeof tag?.id === "string" &&
            typeof tag?.name === "string" &&
            typeof tag?.slug === "string",
        )
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        }));
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const boardValues = React.useMemo(
    () => boards.map((item) => item.slug),
    [boards],
  );
  const tagValues = React.useMemo(() => tags.map((item) => item.slug), [tags]);

  const boardFilter = useRoadmapMultiSelectFilter({
    filterKey: "board",
    popoverKey: "roadmap-filters-boards",
    values: boardValues,
  });
  const tagFilter = useRoadmapMultiSelectFilter({
    filterKey: "tag",
    popoverKey: "roadmap-filters-tags",
    values: tagValues,
  });

  const isActive = filters.board.length > 0 || filters.tag.length > 0;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) setView("root");
    },
    [setOpen],
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="icon-sm"
          aria-label="Filters"
          aria-pressed={isActive}
          className={filterToolbarButtonClass(isActive, className)}
        >
          <ListFilterIcon className="size-4" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" list className="w-fit min-w-0">
        {view === "root" ? (
          <PopoverList>
            <PopoverListItem onClick={() => setView("boards")}>
              <LayersIcon className="size-4 shrink-0" size={16} />
              <span className="text-sm">Boards</span>
              <MenuTrailing count={filters.board.length} />
            </PopoverListItem>
            <PopoverListItem onClick={() => setView("tags")}>
              <TagIcon className="size-4 shrink-0" size={16} />
              <span className="text-sm">Tags</span>
              <MenuTrailing count={filters.tag.length} />
            </PopoverListItem>
          </PopoverList>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setView("root")}
              className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <ChevronLeftIcon className="size-3.5 shrink-0" size={14} />
              <span className="font-medium">
                {view === "boards" ? "Boards" : "Tags"}
              </span>
            </button>
            {view === "boards" ? (
              <RequestMultiSelectFilterList
                items={boards.map((item) => ({
                  id: item.id,
                  label: item.name,
                  value: item.slug,
                }))}
                selected={boardFilter.selected}
                isAllSelected={boardFilter.isAllSelected}
                onToggle={boardFilter.toggle}
                onSelectAll={boardFilter.selectAll}
                isLoading={boardsLoading}
                emptyLabel="No boards"
              />
            ) : (
              <RequestMultiSelectFilterList
                items={tags.map((item) => ({
                  id: item.id,
                  label: item.name,
                  value: item.slug,
                }))}
                selected={tagFilter.selected}
                isAllSelected={tagFilter.isAllSelected}
                onToggle={tagFilter.toggle}
                onSelectAll={tagFilter.selectAll}
                isLoading={tagsLoading}
                emptyLabel="No tags"
              />
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

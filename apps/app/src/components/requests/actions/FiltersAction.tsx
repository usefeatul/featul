"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
  PopoverListBack,
  PopoverSeparator,
} from "@featul/ui/components/popover";
import { Button } from "@featul/ui/components/button";
import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { LayersIcon } from "@featul/ui/icons/layers";
import { TagIcon } from "@featul/ui/icons/tag";
import { CalendarIcon } from "@featul/ui/icons/calendar";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { Clock, MessageCircleOff } from "lucide-react";
import { client } from "@featul/api/client";
import { STALE_STATUS_KEY } from "@featul/api/shared/stale";
import { LOW_INTERACTION_STATUS_KEY } from "@featul/api/shared/low-interaction";
import { SNOOZED_STATUS_KEY } from "@featul/api/shared/snooze";
import { getSlugFromPath } from "@/config/nav";
import { buildRequestsUrl } from "@/utils/request";
import { parseRequestFiltersFromSearchParams } from "@/utils/request/filters";
import { filterToolbarButtonClass } from "@/utils/filter/toolbar";
import {
  fetchWorkspaceStatusCounts,
  workspaceQueryKeys,
} from "@/lib/workspace/client";
import { useFilterPopover } from "@/lib/filter/store";
import {
  RequestMultiSelectFilterList,
  useRequestMultiSelectFilter,
} from "./MultiSelectFilter";

type FilterView = "root" | "boards" | "status" | "tags";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
];

type BoardItem = {
  id: string;
  name: string;
  slug: string;
};

type TagItem = {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  count?: number;
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

export default function FiltersAction({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const queryClient = useQueryClient();
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);
  const [open, setOpen] = useFilterPopover("filters");
  const [view, setView] = React.useState<FilterView>("root");

  const filters = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp),
    [sp],
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
        tags?: Array<{
          id?: string;
          name?: string;
          slug?: string;
          color?: string | null;
          count?: number;
        }>;
      } | null;
      return (Array.isArray(data?.tags) ? data.tags : [])
        .filter(
          (
            tag,
          ): tag is Required<Pick<TagItem, "id" | "name" | "slug">> &
            Pick<TagItem, "color" | "count"> =>
            typeof tag?.id === "string" &&
            typeof tag?.name === "string" &&
            typeof tag?.slug === "string",
        )
        .map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: tag.color ?? null,
          count: typeof tag.count === "number" ? tag.count : undefined,
        }));
    },
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: statusCounts } = useQuery({
    queryKey: workspaceQueryKeys.statusCounts(slug),
    queryFn: () => fetchWorkspaceStatusCounts(slug),
    enabled: Boolean(slug),
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const boardValues = React.useMemo(
    () => boards.map((item) => item.slug),
    [boards],
  );
  const tagValues = React.useMemo(() => tags.map((item) => item.slug), [tags]);
  const statusValues = React.useMemo(
    () => STATUS_OPTIONS.map((option) => option.value),
    [],
  );

  const boardFilter = useRequestMultiSelectFilter({
    filterKey: "board",
    popoverKey: "filters-boards",
    values: boardValues,
  });
  const statusFilter = useRequestMultiSelectFilter({
    filterKey: "status",
    popoverKey: "filters-status",
    values: statusValues,
  });
  const tagFilter = useRequestMultiSelectFilter({
    filterKey: "tag",
    popoverKey: "filters-tags",
    values: tagValues,
  });

  const staleCount = Number(statusCounts?.[STALE_STATUS_KEY] ?? 0);
  const lowInteractionCount = Number(
    statusCounts?.[LOW_INTERACTION_STATUS_KEY] ?? 0,
  );
  const snoozedCount = Number(statusCounts?.[SNOOZED_STATUS_KEY] ?? 0);
  const isStaleActive =
    filters.status.length === 1 && filters.status[0] === STALE_STATUS_KEY;
  const isLowInteractionActive =
    filters.status.length === 1 &&
    filters.status[0] === LOW_INTERACTION_STATUS_KEY;
  const isSnoozedActive =
    filters.status.length === 1 && filters.status[0] === SNOOZED_STATUS_KEY;

  const statusSelectionCount = filters.status.filter(
    (value) =>
      value !== STALE_STATUS_KEY &&
      value !== LOW_INTERACTION_STATUS_KEY &&
      value !== SNOOZED_STATUS_KEY,
  ).length;

  const isActive =
    filters.board.length > 0 ||
    filters.tag.length > 0 ||
    statusSelectionCount > 0 ||
    isStaleActive ||
    isLowInteractionActive ||
    isSnoozedActive;

  const showStale = isStaleActive || staleCount > 0;
  const showLowInteraction = isLowInteractionActive || lowInteractionCount > 0;
  const showSnoozed = isSnoozedActive || snoozedCount > 0;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) setView("root");
    },
    [setOpen],
  );

  React.useEffect(() => {
    if (!open || view !== "tags") return;
    queryClient.prefetchQuery({
      queryKey: ["tags", slug],
      queryFn: async () => {
        const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
        const data = (await res.json().catch(() => null)) as {
          tags?: TagItem[];
        } | null;
        return Array.isArray(data?.tags) ? data.tags : [];
      },
      staleTime: 300_000,
      gcTime: 300_000,
    });
  }, [open, queryClient, slug, view]);

  const regularStatusSelected = React.useMemo(
    () =>
      statusFilter.selected.filter(
        (value) =>
          value !== STALE_STATUS_KEY &&
          value !== LOW_INTERACTION_STATUS_KEY &&
          value !== SNOOZED_STATUS_KEY,
      ),
    [statusFilter.selected],
  );

  const updateStatus = React.useCallback(
    (next: string[]) => {
      const href = buildRequestsUrl(slug, sp, { status: next, page: 1 });
      React.startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [router, slug, sp],
  );

  const toggleStatus = React.useCallback(
    (value: string) => {
      const next = regularStatusSelected.includes(value)
        ? regularStatusSelected.filter((item) => item !== value)
        : [...regularStatusSelected, value];
      updateStatus(next);
    },
    [regularStatusSelected, updateStatus],
  );

  const selectAllStatuses = React.useCallback(() => {
    const allSelected =
      statusValues.length > 0 &&
      statusValues.every((value) => regularStatusSelected.includes(value));
    updateStatus(allSelected ? [] : statusValues);
  }, [regularStatusSelected, statusValues, updateStatus]);

  const toggleSpecialStatus = React.useCallback(
    (
      key:
        | typeof STALE_STATUS_KEY
        | typeof LOW_INTERACTION_STATUS_KEY
        | typeof SNOOZED_STATUS_KEY,
      active: boolean,
    ) => {
      updateStatus(active ? [] : [key]);
    },
    [updateStatus],
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
            <PopoverListItem onClick={() => setView("status")}>
              <ListFilterIcon className="size-4 shrink-0" size={16} />
              <span className="text-sm">Status</span>
              <MenuTrailing count={statusSelectionCount} />
            </PopoverListItem>
            <PopoverListItem onClick={() => setView("tags")}>
              <TagIcon className="size-4 shrink-0" size={16} />
              <span className="text-sm">Tags</span>
              <MenuTrailing count={filters.tag.length} />
            </PopoverListItem>

            {showStale || showLowInteraction || showSnoozed ? (
              <PopoverSeparator />
            ) : null}

            {showStale ? (
              <PopoverListItem
                role="menuitemcheckbox"
                aria-checked={isStaleActive}
                onClick={() =>
                  toggleSpecialStatus(STALE_STATUS_KEY, isStaleActive)
                }
              >
                <CalendarIcon className="size-4 shrink-0" />
                <span className="text-sm">Stale</span>
                <span className="ml-auto text-xs tabular-nums text-accent">
                  {staleCount}
                </span>
                {isStaleActive ? <span className="text-xs">✓</span> : null}
              </PopoverListItem>
            ) : null}

            {showLowInteraction ? (
              <PopoverListItem
                role="menuitemcheckbox"
                aria-checked={isLowInteractionActive}
                onClick={() =>
                  toggleSpecialStatus(
                    LOW_INTERACTION_STATUS_KEY,
                    isLowInteractionActive,
                  )
                }
              >
                <MessageCircleOff
                  className="size-4 shrink-0"
                  strokeWidth={2.25}
                />
                <span className="text-sm">Low traction</span>
                <span className="ml-auto text-xs tabular-nums text-accent">
                  {lowInteractionCount}
                </span>
                {isLowInteractionActive ? (
                  <span className="text-xs">✓</span>
                ) : null}
              </PopoverListItem>
            ) : null}

            {showSnoozed ? (
              <PopoverListItem
                role="menuitemcheckbox"
                aria-checked={isSnoozedActive}
                onClick={() =>
                  toggleSpecialStatus(SNOOZED_STATUS_KEY, isSnoozedActive)
                }
              >
                <Clock className="size-4 shrink-0" strokeWidth={2.25} />
                <span className="text-sm">Snoozed</span>
                <span className="ml-auto text-xs tabular-nums text-accent">
                  {snoozedCount}
                </span>
                {isSnoozedActive ? <span className="text-xs">✓</span> : null}
              </PopoverListItem>
            ) : null}
          </PopoverList>
        ) : (
          <>
            <PopoverListBack onClick={() => setView("root")}>
              <ChevronLeftIcon className="size-3.5 shrink-0" size={14} />
              <span className="font-medium">
                {view === "boards"
                  ? "Boards"
                  : view === "status"
                    ? "Status"
                    : "Tags"}
              </span>
            </PopoverListBack>
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
            ) : null}
            {view === "status" ? (
              <RequestMultiSelectFilterList
                items={STATUS_OPTIONS.map((option) => ({
                  id: option.value,
                  label: option.label,
                  value: option.value,
                }))}
                selected={regularStatusSelected}
                isAllSelected={
                  statusValues.length > 0 &&
                  statusValues.every((value) =>
                    regularStatusSelected.includes(value),
                  )
                }
                onToggle={toggleStatus}
                onSelectAll={selectAllStatuses}
              />
            ) : null}
            {view === "tags" ? (
              <RequestMultiSelectFilterList
                items={tags.map((item) => ({
                  id: item.id,
                  label: item.name,
                  value: item.slug,
                  meta:
                    typeof item.count === "number" ? (
                      <span className="ml-auto text-xs tabular-nums text-accent">
                        {item.count}
                      </span>
                    ) : undefined,
                }))}
                selected={tagFilter.selected}
                isAllSelected={tagFilter.isAllSelected}
                onToggle={tagFilter.toggle}
                onSelectAll={tagFilter.selectAll}
                isLoading={tagsLoading}
                emptyLabel="No tags"
              />
            ) : null}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

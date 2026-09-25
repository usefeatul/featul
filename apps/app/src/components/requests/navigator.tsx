"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  PanelIcon,
} from "@/components/global/icons";

import { Button } from "@featul/ui/components/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip";
import { PANEL_ARIA_SHORTCUTS } from "@/hooks/shortcut";
import { PanelShortcutKeys } from "@/components/global/keys";
import { cn } from "@featul/ui/lib/utils";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { loadMoreRequests } from "@/lib/requests.actions";
import FiltersAction from "./actions/FiltersAction";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { parseRequestFiltersFromSearchParams } from "@/utils/request/filters";
import { QueueItem } from "./queueitem";
import { motion } from "framer-motion";
import { usePanelResize } from "@/hooks/usePanelResize";
import { Resizer } from "@/components/global/resizer";
import type { RequestItemData } from "@/types/request";

export type RequestNavigatorPage = {
  items: RequestItemData[];
  nextOffset: number;
  totalCount: number;
  hasMore: boolean;
};

export default function Navigator({
  workspaceSlug,
  postId,
  open,
  onClose,
  initialWidth,
  initialPage,
}: {
  workspaceSlug: string;
  postId: string;
  open: boolean;
  initialWidth?: number;
  initialPage?: RequestNavigatorPage;
  onClose: () => void;
}) {
  const resize = usePanelResize(open, "requests", initialWidth, "left");
  const searchParams = useSearchParams();
  const [filterQuery, setFilterQuery] = useState(searchParams.toString());
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchOpen, setSearchOpen] = useState(Boolean(search));
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams(filterQuery);
  if (debouncedSearch) params.set("search", debouncedSearch);
  else params.delete("search");
  params.delete("page");
  const query = params.toString();
  const initialQuery = useRef(query).current;
  const filters = parseRequestFiltersFromSearchParams(params);
  const filterChips = [
    filters.status.length > 0
      ? { key: "status", label: `${filters.status.length} status` }
      : null,
    filters.board.length > 0
      ? { key: "board", label: `${filters.board.length} board` }
      : null,
    filters.tag.length > 0
      ? { key: "tag", label: `${filters.tag.length} tag` }
      : null,
    filters.order !== "newest" ? { key: "order", label: filters.order } : null,
  ].filter((chip): chip is { key: string; label: string } => Boolean(chip));

  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState(postId);

  useEffect(() => setSelectedId(postId), [postId]);

  const { data, hasNextPage, isFetching, isError, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["request-navigator", workspaceSlug, query],
      initialPageParam: 0,
      queryFn: ({ pageParam }) =>
        loadMoreRequests({
          slug: workspaceSlug,
          offset: pageParam,
          variant: "requests",
          query,
        }),
      getNextPageParam: (page, _pages, previousOffset) =>
        page.hasMore &&
        page.items.length > 0 &&
        page.nextOffset > previousOffset
          ? page.nextOffset
          : undefined,
      initialData:
        initialPage && query === initialQuery
          ? { pages: [initialPage], pageParams: [0] }
          : undefined,
      placeholderData: keepPreviousData,
      staleTime: 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
    });

  const listItems = [
    ...new Map(
      (data?.pages.flatMap((page) => page.items) ?? []).map((item) => [
        item.id,
        item,
      ]),
    ).values(),
  ];
  const totalCount = data?.pages[0]?.totalCount ?? listItems.length;
  const selectedIndex = listItems.findIndex((item) => item.id === selectedId);
  const positionLabel =
    selectedIndex >= 0
      ? `${selectedIndex + 1} of ${totalCount}`
      : `${totalCount}`;
  const clearFilter = (key: string) => {
    const next = new URLSearchParams(filterQuery);
    next.delete(key);
    next.delete("page");
    setFilterQuery(next.toString());
  };

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        queryClient.getQueryData<number>([
          "request-navigator-scroll",
          workspaceSlug,
          query,
        ]) ?? 0;
    }
  }, [queryClient, workspaceSlug, query]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!open || !sentinel || !hasNextPage || isFetching || isError) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) void fetchNextPage();
      },
      { root: scrollRef.current, rootMargin: "0px 0px 600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasNextPage, isFetching, isError, fetchNextPage]);

  return (
    <>
      <button
        type="button"
        aria-label="Close request queue"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 z-20 bg-black/35 backdrop-blur-[1px] transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <motion.aside
        ref={resize.panelRef}
        style={resize.style}
        id="request-navigator"
        aria-label="Request queue"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "absolute inset-x-0 bottom-0 z-30 h-[min(78dvh,44rem)] overflow-hidden rounded-t-2xl bg-background shadow-2xl transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none dark:bg-sidebar",
          "md:relative md:inset-auto md:z-10 md:h-full md:shrink-0 md:rounded-none md:bg-transparent md:shadow-none md:transition-[width,opacity] md:duration-200",
          open
            ? "translate-y-0 opacity-100 md:w-[var(--resizable-panel-width)] md:translate-y-0"
            : "pointer-events-none translate-y-full opacity-0 md:w-0 md:translate-y-0",
          resize.isResizing && "md:transition-none",
        )}
      >
        <Resizer
          resize={resize}
          controls="request-navigator"
          label="Resize request sidebar"
          className="hidden md:flex"
        />
        <div className="flex h-full w-full flex-col overflow-hidden border-t border-border/70 bg-background md:w-[var(--resizable-panel-width)] md:rounded-none md:border-0 md:border-r md:border-border/60 md:shadow-none dark:border-sidebar-border dark:bg-sidebar">
          <div
            aria-hidden
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border md:hidden"
          />
          <div className="flex min-h-13 shrink-0 items-center justify-between px-3">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate text-sm font-semibold">Request queue</h2>
              {data ? (
                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {positionLabel}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="plain"
                onClick={() => setSearchOpen((value) => !value)}
                aria-label={
                  searchOpen ? "Hide request search" : "Search request queue"
                }
                aria-expanded={searchOpen}
                className={cn(
                  "size-8 rounded-md border-0 bg-transparent p-0 text-accent shadow-none hover:bg-black/[0.06] dark:bg-transparent dark:hover:bg-white/[0.03]",
                  search && "text-primary",
                )}
              >
                <Search className="size-[18px]" />
              </Button>
              <FiltersAction
                query={query}
                onQueryChange={setFilterQuery}
                showClear
                className="size-8 rounded-md border-0 bg-transparent p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.06] data-[state=open]:bg-black/[0.06] dark:bg-transparent dark:hover:bg-white/[0.03] dark:data-[state=open]:bg-white/[0.03] [&_svg]:size-[18px]"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="plain"
                    onClick={onClose}
                    aria-label="Hide request list"
                    aria-keyshortcuts={PANEL_ARIA_SHORTCUTS}
                    aria-expanded={true}
                    aria-controls="request-navigator"
                    className="size-8 rounded-md border-0 bg-transparent p-0 text-accent shadow-none hover:bg-black/10 dark:bg-transparent dark:hover:bg-white/[0.03]"
                  >
                    <PanelIcon filled className="size-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium"
                >
                  <span>Hide request list</span>
                  <PanelShortcutKeys />
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {searchOpen ? (
            <div className="px-3 pb-2 pt-1">
              <label className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-transparent px-3 text-accent focus-within:border-ring/40 focus-within:ring-1 focus-within:ring-ring dark:border-white/10">
                <Search className="size-4 shrink-0" />
                <input
                  autoFocus
                  aria-label="Search request queue"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search requests…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-accent"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear request search"
                    className="rounded p-0.5 hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </label>
            </div>
          ) : null}

          {filterChips.length > 0 ? (
            <div className="scrollbar-hide flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-2">
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => clearFilter(chip.key)}
                  className="inline-flex h-6 shrink-0 cursor-pointer items-center gap-1 rounded-md bg-black/5 px-2 text-[10px] font-medium capitalize text-muted-foreground transition-colors hover:bg-black/10 hover:text-foreground dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
                  aria-label={`Remove ${chip.label} filter`}
                >
                  {chip.label}
                  <X className="size-2.5" aria-hidden />
                </button>
              ))}
            </div>
          ) : null}

          <div
            ref={scrollRef}
            onScroll={(event) =>
              queryClient.setQueryData(
                ["request-navigator-scroll", workspaceSlug, query],
                event.currentTarget.scrollTop,
              )
            }
            data-workspace-scroll
            className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3"
            aria-busy={isFetching}
          >
            <ul className="m-0 min-w-0 list-none divide-y divide-border/50 pb-2 dark:divide-white/[0.07]">
              {listItems.map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  workspaceSlug={workspaceSlug}
                  query={query}
                  active={item.id === selectedId}
                  onSelect={() => {
                    setSelectedId(item.id);
                    if (window.matchMedia("(max-width: 767px)").matches)
                      onClose();
                  }}
                />
              ))}
            </ul>
            {data &&
            !hasNextPage &&
            !listItems.length &&
            !isFetching &&
            !isError ? (
              <p className="px-3 py-6 text-center text-sm text-accent">
                No requests found.
              </p>
            ) : null}
            <div
              ref={sentinelRef}
              className="flex min-h-8 items-center justify-center"
            >
              {isError ? (
                <Button
                  variant="plain"
                  size="sm"
                  onClick={() => void (data ? fetchNextPage() : refetch())}
                >
                  Retry
                </Button>
              ) : null}
              {!isError && data && isFetching ? (
                <LoaderIcon
                  className="size-3.5 text-muted-foreground"
                  size={14}
                />
              ) : null}
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

"use client";

import { WidgetButton } from "./button";

import * as React from "react";
import { client } from "@featul/api/client";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { ArrowUpDownIcon } from "@featul/ui/icons/arrow-up-down";
import { LayersIcon } from "@featul/ui/icons/layers";
import { ListFilterIcon, SearchIcon, X } from "@/components/global/icons";
import { FillFeedbackIcon } from "@featul/ui/icons/fill-feedback";

import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import { WidgetEmpty, WidgetEmptyPlaceholders } from "./empty";
import { parseWidgetPosts } from "./load";
import { WidgetFeedbackListSkeleton, WidgetPostRowSkeleton } from "./skeleton";
import type { Board, IdentifiedUser, WidgetApiBase, WidgetPost } from "./types";
import { viewerPayload } from "./utils";
import { WidgetPostRow } from "./row";
import { useWidgetPosts } from "@/hooks/useWidgetPosts";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "top", label: "Top" },
] as const;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "review", label: "Review" },
  { value: "planned", label: "Planned" },
  { value: "progress", label: "Progress" },
  { value: "completed", label: "Complete" },
  { value: "closed", label: "Closed" },
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number]["value"] | "";

const toolbarControlClass =
  "border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.05)]";

const toolbarBtnClass = `inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md ${toolbarControlClass} text-[rgb(var(--widget-fg)/0.55)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.08)] hover:text-[rgb(var(--widget-fg)/0.8)]`;

const toolbarBtnActiveClass =
  "border-[rgb(var(--widget-fg)/0.18)] bg-[rgb(var(--widget-fg)/0.1)] text-[rgb(var(--widget-fg)/0.9)]";

const popoverClass =
  "z-[80] min-w-0 w-fit border border-[rgb(var(--widget-fg)/0.12)] bg-[rgb(var(--widget-surface))] p-0 text-[rgb(var(--widget-fg))] shadow-lg";

const popoverItemClass =
  "gap-2 px-3 py-2 text-sm text-[rgb(var(--widget-fg)/0.85)] hover:bg-[rgb(var(--widget-fg)/0.06)] dark:hover:bg-[rgb(var(--widget-fg)/0.06)]";

const popoverStyle = {
  backgroundColor: "rgb(var(--widget-surface))",
  color: "rgb(var(--widget-fg))",
} as const;

type Props = {
  apiBase: WidgetApiBase;
  boards: Board[];
  boardId: string;
  onBoardChange: (boardId: string) => void;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  refreshKey?: number;
  /** When false, list stays mounted but inactive (preserves scroll/data). */
  active?: boolean;
  /** Sync a vote from detail view without refetching the list. */
  votePatch?: { postId: string; upvotes: number; hasVoted: boolean } | null;
  onOpenPost: (post: WidgetPost) => void;
  onCompose: () => void;
};

export function WidgetFeedbackList({
  apiBase,
  boards,
  boardId,
  onBoardChange,
  userId,
  identity,
  refreshKey = 0,
  active = true,
  votePatch = null,
  onOpenPost,
  onCompose,
}: Props) {
  const [sort, setSort] = React.useState<"newest" | "top">("newest");
  const [status, setStatus] = React.useState<StatusFilter>("");
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [sortOpen, setSortOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [boardOpen, setBoardOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const savedScrollTop = React.useRef(0);
  React.useEffect(() => {
    // Keep scroll position when navigating away to detail/compose and back.
    if (!active) {
      savedScrollTop.current =
        scrollRef.current?.scrollTop ?? savedScrollTop.current;
      return;
    }
    const node = scrollRef.current;
    if (!node) return;
    const top = savedScrollTop.current;
    const frame = requestAnimationFrame(() => {
      node.scrollTop = top;
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  React.useEffect(() => {
    savedScrollTop.current = 0;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [boardId, query, sort, status]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const fetchPage = React.useCallback(
    async (offset: number, signal: AbortSignal) => {
      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const res = await client.widget.posts.$get(
        {
          ...viewerPayload(apiBase, { userId, identity, fingerprint }),
          boardId: boardId || undefined,
          search: query || undefined,
          sort,
          status: status || undefined,
          limit: 20,
          offset,
        },
        { init: { signal } },
      );
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      return {
        posts: parseWidgetPosts(data.posts),
        nextOffset:
          typeof data.nextOffset === "number" ? data.nextOffset : null,
      };
    },
    [apiBase, boardId, identity, query, sort, status, userId],
  );

  const {
    posts,
    setPosts,
    loading,
    loadingMore,
    nextOffset,
    error,
    hasLoaded,
    loadMore,
    retry,
  } = useWidgetPosts({
    fetchPage,
    refreshKey,
    viewerKey: JSON.stringify([apiBase, userId, identity?.id, identity?.email]),
  });

  React.useEffect(() => {
    if (!votePatch) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === votePatch.postId
          ? {
              ...post,
              upvotes: votePatch.upvotes,
              hasVoted: votePatch.hasVoted,
            }
          : post,
      ),
    );
  }, [votePatch, setPosts]);

  const clearFilters = () => {
    setSearch("");
    setQuery("");
    setStatus("");
    onBoardChange("");
  };
  const hasFilters = Boolean(query || status || boardId);

  React.useEffect(() => {
    if (!active || loading || loadingMore || error) return;
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        void loadMore();
      },
      { root, rootMargin: "120px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [active, loadMore, loading, loadingMore, error, posts.length, nextOffset]);

  const onVoteChange = (postId: string, upvotes: number, hasVoted: boolean) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, upvotes, hasVoted } : post,
      ),
    );
  };

  const selectedBoard = boards.find((board) => board.id === boardId);
  const boardLabel = selectedBoard?.name || "All boards";
  const sortLabel = sort === "newest" ? "Newest" : "Top";
  const statusFilterLabel = status ? statusLabel(status) : "All statuses";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative z-10 flex items-center gap-2 px-4 pb-3 pt-1">
        <div className="relative min-w-0 flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[rgb(var(--widget-fg)/0.35)]"
            size={14}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback"
            aria-label="Search feedback"
            className={`h-9 w-full rounded-md ${toolbarControlClass} pl-9 pr-9 text-sm text-[rgb(var(--widget-fg))] outline-none placeholder:text-[rgb(var(--widget-fg)/0.3)] focus:bg-[rgb(var(--widget-fg)/0.07)]`}
          />
          {search ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
              className="absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded text-[rgb(var(--widget-fg)/0.55)] hover:bg-[rgb(var(--widget-fg)/0.08)]"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>

        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={toolbarBtnClass}
              aria-label={`Sort by ${sortLabel}`}
              title={sortLabel}
            >
              <ArrowUpDownIcon className="size-3.5" size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            list
            align="end"
            className={popoverClass}
            style={popoverStyle}
          >
            <PopoverList>
              {SORT_OPTIONS.map((option) => (
                <PopoverListItem
                  key={option.value}
                  role="menuitemradio"
                  aria-checked={sort === option.value}
                  className={popoverItemClass}
                  onClick={() => {
                    setSort(option.value);
                    setSortOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {sort === option.value ? (
                    <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">
                      ✓
                    </span>
                  ) : null}
                </PopoverListItem>
              ))}
            </PopoverList>
          </PopoverContent>
        </Popover>

        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`${toolbarBtnClass}${status ? ` ${toolbarBtnActiveClass}` : ""}`}
              aria-label={`Filter by status: ${statusFilterLabel}`}
              title={statusFilterLabel}
            >
              <ListFilterIcon className="size-3.5" size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            list
            align="end"
            className={popoverClass}
            style={popoverStyle}
          >
            <PopoverList>
              <PopoverListItem
                role="menuitemradio"
                aria-checked={!status}
                className={popoverItemClass}
                onClick={() => {
                  setStatus("");
                  setStatusOpen(false);
                }}
              >
                <span>All statuses</span>
                {!status ? (
                  <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">
                    ✓
                  </span>
                ) : null}
              </PopoverListItem>
              {STATUS_OPTIONS.map((option) => (
                <PopoverListItem
                  key={option.value}
                  role="menuitemradio"
                  aria-checked={status === option.value}
                  className={popoverItemClass}
                  onClick={() => {
                    setStatus(option.value);
                    setStatusOpen(false);
                  }}
                >
                  <StatusIcon
                    status={option.value}
                    className="size-3.5 shrink-0"
                  />
                  <span className="whitespace-nowrap">{option.label}</span>
                  {status === option.value ? (
                    <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">
                      ✓
                    </span>
                  ) : null}
                </PopoverListItem>
              ))}
            </PopoverList>
          </PopoverContent>
        </Popover>

        {boards.length > 1 ? (
          <Popover open={boardOpen} onOpenChange={setBoardOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={`${toolbarBtnClass}${boardId ? ` ${toolbarBtnActiveClass}` : ""}`}
                aria-label={`Filter by board: ${boardLabel}`}
                title={boardLabel}
              >
                <LayersIcon className="size-3.5" size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              list
              align="end"
              className={popoverClass}
              style={popoverStyle}
            >
              <PopoverList>
                <PopoverListItem
                  role="menuitemradio"
                  aria-checked={!boardId}
                  className={popoverItemClass}
                  onClick={() => {
                    onBoardChange("");
                    setBoardOpen(false);
                  }}
                >
                  <span>All boards</span>
                  {!boardId ? (
                    <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">
                      ✓
                    </span>
                  ) : null}
                </PopoverListItem>
                {boards.map((board) => (
                  <PopoverListItem
                    key={board.id}
                    role="menuitemradio"
                    aria-checked={boardId === board.id}
                    className={popoverItemClass}
                    onClick={() => {
                      onBoardChange(board.id);
                      setBoardOpen(false);
                    }}
                  >
                    <span className="whitespace-nowrap">{board.name}</span>
                    {boardId === board.id ? (
                      <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">
                        ✓
                      </span>
                    ) : null}
                  </PopoverListItem>
                ))}
              </PopoverList>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      {hasFilters ? (
        <div className="flex items-center justify-between gap-2 px-4 pb-3 text-xs text-[rgb(var(--widget-fg)/0.6)]">
          <span className="truncate">
            {[
              selectedBoard?.name,
              status && statusFilterLabel,
              query && `“${query}”`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="shrink-0 font-medium underline underline-offset-4"
          >
            Clear filters
          </button>
        </div>
      ) : null}
      {!loading && error ? (
        <div
          role="status"
          className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-md bg-[rgb(var(--widget-fg)/0.05)] px-3 py-2 text-xs"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void retry()}
            className="shrink-0 font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      ) : null}
      {!loading && !error && !posts.length ? (
        <WidgetEmpty
          title={hasFilters ? "No matching feedback" : "No requests yet"}
          description={
            hasFilters
              ? "Try another search or clear your filters."
              : "Share an idea or report an issue to get the conversation started."
          }
          icon={<FillFeedbackIcon className="size-5" size={20} />}
        >
          {!hasFilters ? <WidgetEmptyPlaceholders /> : null}
          <WidgetButton
            type="button"
            className="mt-5 h-8 px-3 text-xs font-semibold"
            onClick={hasFilters ? clearFilters : onCompose}
          >
            {hasFilters ? "Clear filters" : "Give feedback"}
          </WidgetButton>
        </WidgetEmpty>
      ) : null}

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide"
      >
        {loading && !hasLoaded ? <WidgetFeedbackListSkeleton /> : null}
        {posts.map((post) => (
          <WidgetPostRow
            key={post.id}
            post={post}
            apiBase={apiBase}
            userId={userId}
            identity={identity}
            onOpen={onOpenPost}
            onVoteChange={onVoteChange}
          />
        ))}
        {nextOffset !== null && !error ? (
          <div ref={sentinelRef} className="w-full" aria-busy={loadingMore}>
            {loadingMore ? (
              <>
                <WidgetPostRowSkeleton />
                <WidgetPostRowSkeleton />
              </>
            ) : (
              <button
                type="button"
                onClick={() => void loadMore()}
                className="mx-auto my-3 block rounded-md px-3 py-2 text-xs font-medium text-[rgb(var(--widget-fg)/0.65)] hover:bg-[rgb(var(--widget-fg)/0.06)]"
              >
                Load more feedback
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

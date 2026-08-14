"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { ArrowUpDownIcon } from "@featul/ui/icons/arrow-up-down";
import { LayersIcon } from "@featul/ui/icons/layers";
import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { SearchIcon } from "@featul/ui/icons/search";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type { Board, IdentifiedUser, WidgetApiBase, WidgetPost } from "./types";
import { viewerPayload } from "./utils";
import { WidgetPostRow } from "./PostRow";

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

const toolbarBtnClass =
  `inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md ${toolbarControlClass} text-[rgb(var(--widget-fg)/0.55)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.08)] hover:text-[rgb(var(--widget-fg)/0.8)]`;

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
  const [posts, setPosts] = React.useState<WidgetPost[]>([]);
  const [sort, setSort] = React.useState<"newest" | "top">("newest");
  const [status, setStatus] = React.useState<StatusFilter>("");
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [nextOffset, setNextOffset] = React.useState<number | null>(null);
  const [error, setError] = React.useState("");
  const [sortOpen, setSortOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [boardOpen, setBoardOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const savedScrollTop = React.useRef(0);
  const hasLoadedOnce = React.useRef(false);
  const loadingMoreRef = React.useRef(false);
  const nextOffsetRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  React.useEffect(() => {
    nextOffsetRef.current = nextOffset;
  }, [nextOffset]);

  React.useEffect(() => {
    // Keep scroll position when navigating away to detail/compose and back.
    if (!active) {
      savedScrollTop.current = scrollRef.current?.scrollTop ?? savedScrollTop.current;
      return;
    }
    const node = scrollRef.current;
    if (!node) return;
    const top = savedScrollTop.current;
    requestAnimationFrame(() => {
      node.scrollTop = top;
    });
  }, [active]);

  React.useEffect(() => {
    if (!votePatch) return;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === votePatch.postId
          ? { ...post, upvotes: votePatch.upvotes, hasVoted: votePatch.hasVoted }
          : post,
      ),
    );
  }, [votePatch]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = React.useCallback(
    async (offset = 0, append = false) => {
      if (append) {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");
      try {
        const fingerprint =
          userId || identity?.email ? undefined : await getBrowserFingerprint();
        const res = await client.widget.posts.$get({
          ...viewerPayload(apiBase, { userId, identity, fingerprint }),
          boardId: boardId || undefined,
          search: query || undefined,
          sort,
          status: status || undefined,
          limit: 20,
          offset,
        });
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        const nextPosts = (Array.isArray(data.posts) ? data.posts : []) as WidgetPost[];
        setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
        const upcoming =
          typeof data.nextOffset === "number" ? (data.nextOffset as number) : null;
        nextOffsetRef.current = upcoming;
        setNextOffset(upcoming);
        hasLoadedOnce.current = true;
      } catch {
        if (!append) setPosts([]);
        setError("Could not load requests.");
      } finally {
        setLoading(false);
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    },
    [apiBase, boardId, identity, query, sort, status, userId],
  );

  React.useEffect(() => {
    // Initial load, filter/sort changes, or explicit refresh — not on detail↔list nav.
    load(0, false);
  }, [load, refreshKey]);

  React.useEffect(() => {
    if (!active) return;
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        const offset = nextOffsetRef.current;
        if (offset === null || loadingMoreRef.current) return;
        void load(offset, true);
      },
      { root, rootMargin: "120px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [active, load, posts.length, nextOffset]);

  const onVoteChange = (postId: string, upvotes: number, hasVoted: boolean) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, upvotes, hasVoted } : post)),
    );
  };

  const selectedBoard = boards.find((board) => board.id === boardId);
  const boardLabel = selectedBoard?.name || "All boards";
  const sortLabel = sort === "newest" ? "Newest" : "Top";
  const statusFilterLabel = status ? statusLabel(status) : "All statuses";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-4 pb-3 pt-1">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[rgb(var(--widget-fg)/0.35)]" size={14} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback"
            className={`h-9 w-full rounded-md ${toolbarControlClass} pl-9 pr-3 text-sm text-[rgb(var(--widget-fg))] outline-none placeholder:text-[rgb(var(--widget-fg)/0.3)] focus:bg-[rgb(var(--widget-fg)/0.07)]`}
          />
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
          <PopoverContent list align="end" className={popoverClass} style={popoverStyle}>
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
                    <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">✓</span>
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
          <PopoverContent list align="end" className={popoverClass} style={popoverStyle}>
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
                  <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">✓</span>
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
                  <StatusIcon status={option.value} className="size-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{option.label}</span>
                  {status === option.value ? (
                    <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">✓</span>
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
            <PopoverContent list align="end" className={popoverClass} style={popoverStyle}>
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
                    <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">✓</span>
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
                      <span className="ml-auto text-xs text-[rgb(var(--widget-fg)/0.45)]">✓</span>
                    ) : null}
                  </PopoverListItem>
                ))}
              </PopoverList>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>

      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide">
        {loading && !hasLoadedOnce.current ? (
          <div
            className="flex min-h-0 flex-1 items-center justify-center"
            aria-label="Loading"
          >
            <LoaderIcon className="size-5 animate-spin text-[rgb(var(--widget-fg)/0.45)]" />
          </div>
        ) : null}
        {error ? (
          <p className="mx-4 my-4 rounded-md bg-[rgb(var(--widget-fg)/0.04)] px-3 py-2 text-sm text-[rgb(var(--widget-fg)/0.85)]">
            {error}
          </p>
        ) : null}
        {!loading && !error && !posts.length ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <p className="text-sm font-medium text-[rgb(var(--widget-fg))]">No requests yet</p>
            <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
              Share an idea or report an issue to get the conversation started.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-5 h-8 cursor-pointer rounded-md bg-[rgb(var(--widget-cta))] px-3 text-xs font-semibold text-[rgb(var(--widget-cta-fg))] hover:opacity-90"
              onClick={onCompose}
            >
              Give feedback
            </Button>
          </div>
        ) : null}
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
        {nextOffset !== null ? (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center py-4"
            aria-hidden={!loadingMore}
            aria-label={loadingMore ? "Loading more" : undefined}
          >
            {loadingMore ? (
              <LoaderIcon className="size-4 animate-spin text-[rgb(var(--widget-fg)/0.45)]" />
            ) : (
              <span className="h-4" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { ArrowDownWideNarrow, Search } from "lucide-react";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type { Board, IdentifiedUser, WidgetApiBase, WidgetPost } from "./types";
import { viewerPayload } from "./utils";
import { WidgetPostRow } from "./PostRow";

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
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [nextOffset, setNextOffset] = React.useState<number | null>(null);
  const [error, setError] = React.useState("");
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
    [apiBase, boardId, identity, query, sort, userId],
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

  const cycleSort = () => setSort((prev) => (prev === "newest" ? "top" : "newest"));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 px-4 pb-3 pt-1">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[rgb(var(--widget-fg)/0.35)]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback"
            className="h-9 w-full rounded-md bg-[rgb(var(--widget-fg)/0.05)] pl-9 pr-3 text-sm text-[rgb(var(--widget-fg))] outline-none placeholder:text-[rgb(var(--widget-fg)/0.3)] focus:bg-[rgb(var(--widget-fg)/0.07)]"
          />
        </div>
        <button
          type="button"
          onClick={cycleSort}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-[rgb(var(--widget-fg)/0.05)] px-2.5 text-xs text-[rgb(var(--widget-fg)/0.55)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.08)] hover:text-[rgb(var(--widget-fg)/0.8)]"
          aria-label={`Sort by ${sort === "newest" ? "top" : "newest"}`}
          title={sort === "newest" ? "Newest" : "Top"}
        >
          <ArrowDownWideNarrow className="size-3.5" />
          <span className="capitalize">{sort}</span>
        </button>
        {boards.length > 1 ? (
          <select
            value={boardId}
            onChange={(event) => onBoardChange(event.target.value)}
            className="h-9 max-w-[7.5rem] cursor-pointer rounded-md bg-[rgb(var(--widget-fg)/0.05)] px-2 text-xs text-[rgb(var(--widget-fg)/0.7)] outline-none hover:bg-[rgb(var(--widget-fg)/0.08)]"
            aria-label="Filter by board"
          >
            <option value="">All boards</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
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

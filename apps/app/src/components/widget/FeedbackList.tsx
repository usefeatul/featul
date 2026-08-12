"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
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

  React.useEffect(() => {
    const timer = window.setTimeout(() => setQuery(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = React.useCallback(
    async (offset = 0, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
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
        setNextOffset(typeof data.nextOffset === "number" ? data.nextOffset : null);
      } catch {
        if (!append) setPosts([]);
        setError("Could not load requests.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [apiBase, boardId, identity, query, sort, userId],
  );

  React.useEffect(() => {
    load(0, false);
  }, [load, refreshKey]);

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
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback"
            className="h-9 w-full rounded-md bg-white/[0.05] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/[0.07]"
          />
        </div>
        <button
          type="button"
          onClick={cycleSort}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 text-xs text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white/80"
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
            className="h-9 max-w-[7.5rem] cursor-pointer rounded-md bg-white/[0.05] px-2 text-xs text-white/70 outline-none hover:bg-white/[0.08]"
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? <p className="px-5 py-10 text-center text-sm text-white/45">Loading...</p> : null}
        {error ? (
          <p className="mx-4 my-4 rounded-md bg-white/[0.04] px-3 py-2 text-sm text-white/85">
            {error}
          </p>
        ) : null}
        {!loading && !error && !posts.length ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <p className="text-sm font-medium text-white">No requests yet</p>
            <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-white/45">
              Share an idea or report an issue to get the conversation started.
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-5 h-8 cursor-pointer rounded-md bg-white px-3 text-xs font-semibold text-neutral-900 hover:opacity-90"
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
          <div className="px-4 py-4">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => load(nextOffset, true)}
              className="w-full cursor-pointer rounded-md bg-white/[0.04] py-2.5 text-xs text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

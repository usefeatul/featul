"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Search } from "lucide-react";
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-2 px-5 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requests"
            className="h-9 w-full rounded-md border border-white/10 bg-[#202020] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-white/10 bg-[#202020] p-0.5">
            {(["newest", "top"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSort(value)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-xs capitalize transition-colors ${
                  sort === value
                    ? "bg-[var(--widget-accent,#3b82f6)] text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          {boards.length > 1 ? (
            <select
              value={boardId}
              onChange={(event) => onBoardChange(event.target.value)}
              className="h-8 min-w-0 flex-1 cursor-pointer rounded-md border border-white/10 bg-[#202020] px-3 text-xs text-white outline-none"
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/10">
        {loading ? <p className="px-5 py-8 text-center text-sm text-white/45">Loading...</p> : null}
        {error ? (
          <p className="mx-5 my-3 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/85">
            {error}
          </p>
        ) : null}
        {!loading && !error && !posts.length ? (
          <div className="mx-5 my-4 rounded-md border border-dashed border-white/10 px-4 py-8 text-center">
            <p className="text-sm font-medium text-white">No requests yet</p>
            <p className="mt-1 text-xs text-white/45">Be the first to share an idea.</p>
            <Button
              type="button"
              size="sm"
              className="mt-4 h-8 cursor-pointer rounded-md px-3 text-xs text-white hover:opacity-90"
              style={{ backgroundColor: "var(--widget-accent, #3b82f6)" }}
              onClick={onCompose}
            >
              Submit request
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
          <div className="border-t border-white/10 px-5 py-3">
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => load(nextOffset, true)}
              className="w-full cursor-pointer rounded-md border border-white/10 bg-[#202020] py-2.5 text-xs text-white/70 transition-colors hover:bg-[#242424] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WidgetPost } from "@/components/widget/types";

type Page = { posts: WidgetPost[]; nextOffset: number | null };

/** Keeps list navigation local and prevents obsolete requests from replacing current results. */
export function useWidgetPosts({
  fetchPage,
  refreshKey,
  viewerKey,
}: {
  fetchPage: (offset: number, signal: AbortSignal) => Promise<Page>;
  refreshKey: number;
  viewerKey: string;
}) {
  const [posts, setPosts] = useState<WidgetPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const offsetRef = useRef<number | null>(null);
  const failedOffset = useRef(0);

  const load = useCallback(
    async (offset = 0) => {
      const append = offset > 0;
      if (append && pending.current) return;
      controller.current?.abort();
      const request = new AbortController();
      controller.current = request;
      pending.current = true;
      failedOffset.current = offset;
      setError("");
      setLoading(!append);
      setLoadingMore(append);
      if (!append) {
        offsetRef.current = null;
        setNextOffset(null);
      }
      try {
        const page = await fetchPage(offset, request.signal);
        if (request.signal.aborted) return;
        setPosts((current) => {
          const rows = append ? [...current, ...page.posts] : page.posts;
          const seen = new Set<string>();
          return rows.filter((post) => {
            if (seen.has(post.id)) return false;
            seen.add(post.id);
            return true;
          });
        });
        const next =
          page.posts.length &&
          page.nextOffset !== null &&
          page.nextOffset > offset
            ? page.nextOffset
            : null;
        offsetRef.current = next;
        setNextOffset(next);
        setHasLoaded(true);
      } catch {
        if (!request.signal.aborted)
          setError(
            append
              ? "Couldn’t load more feedback."
              : "Couldn’t update feedback.",
          );
      } finally {
        if (!request.signal.aborted) {
          pending.current = false;
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    setPosts([]);
    setHasLoaded(false);
  }, [viewerKey]);

  useEffect(() => {
    void load();
    return () => {
      controller.current?.abort();
    };
  }, [load, refreshKey, viewerKey]);

  const loadMore = useCallback(() => {
    if (offsetRef.current === null || error) return;
    return load(offsetRef.current);
  }, [error, load]);
  const retry = useCallback(() => load(failedOffset.current), [load]);

  return {
    posts,
    setPosts,
    loading,
    loadingMore,
    nextOffset,
    error,
    hasLoaded,
    loadMore,
    retry,
  };
}

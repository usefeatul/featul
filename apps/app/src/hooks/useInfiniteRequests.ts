"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadMoreRequests } from "@/lib/requests.actions";
import type { RequestItemData } from "@/types/request";

export function useInfiniteRequests({
  items,
  workspaceSlug,
  initialOffset,
  initialTotalCount,
  variant,
  queryOverride,
}: {
  items: RequestItemData[];
  workspaceSlug: string;
  initialOffset: number;
  initialTotalCount: number;
  variant: "workspace" | "requests";
  queryOverride?: string;
}) {
  const searchParams = useSearchParams();
  const query = queryOverride ?? searchParams.toString();
  const [listItems, setListItems] = useState(items);
  const [hasMore, setHasMore] = useState(initialOffset < initialTotalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialOffset);
  const loadingRef = useRef(false);
  const generationRef = useRef(0);

  // A route refresh or filter change starts a fresh list. Ignore any older response.
  useEffect(() => {
    generationRef.current += 1;
    offsetRef.current = initialOffset;
    loadingRef.current = false;
    setListItems(items);
    setHasMore(initialOffset < initialTotalCount);
    setIsLoading(false);
    setError(false);
    sentinelRef.current?.closest("[data-workspace-scroll]")?.scrollTo({ top: 0 });
    return () => { generationRef.current += 1; };
  }, [items, workspaceSlug, query, variant, initialOffset, initialTotalCount]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(false);
    const generation = generationRef.current;
    const requestedOffset = offsetRef.current;
    try {
      const batch = await loadMoreRequests({
        slug: workspaceSlug,
        offset: requestedOffset,
        variant,
        query,
      });
      if (generation !== generationRef.current) return;
      setListItems((current) => {
        const ids = new Set(current.map((item) => item.id));
        return [...current, ...batch.items.filter((item) => {
          if (ids.has(item.id)) return false;
          ids.add(item.id);
          return true;
        })];
      });
      offsetRef.current = batch.nextOffset;
      setHasMore(batch.hasMore && batch.items.length > 0 && batch.nextOffset > requestedOffset);
    } catch {
      if (generation === generationRef.current) setError(true);
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [hasMore, workspaceSlug, variant, query]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading || error) return;
    const scrollRoot = sentinel.closest("[data-workspace-scroll]");
    // Fetch roughly a screen ahead so the next batch is ready before the bottom.
    const prefetchDistance = Math.max(480, scrollRoot?.clientHeight ?? window.innerHeight);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void loadMore();
    }, {
      root: scrollRoot,
      rootMargin: `0px 0px ${prefetchDistance}px 0px`,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, error, loadMore]);

  return { listItems, setListItems, sentinelRef, hasMore, isLoading, error, loadMore };
}

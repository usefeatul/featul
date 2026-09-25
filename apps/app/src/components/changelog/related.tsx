"use client";

import { useEffect, useState } from "react";
import { client } from "@featul/api/client";
import type { RelatedPost } from "@featul/api/changelog/related";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { Skeleton } from "@featul/ui/components/skeleton";
import { Button } from "@featul/ui/components/button";
import { X, Link2, Search, Check } from "@/components/global/icons";

import StatusIcon from "@/components/requests/StatusIcon";

export function Related({
  workspaceSlug,
  selectedIds,
  onChange,
}: {
  workspaceSlug: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<RelatedPost[]>([]);
  const [known, setKnown] = useState<Record<string, RelatedPost>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!selectedIds.length) return;
    let cancelled = false;
    client.changelog.relatedPostsSearch
      .$get({ slug: workspaceSlug, ids: selectedIds })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled)
          setKnown((previous) => ({
            ...previous,
            ...Object.fromEntries(data.posts.map((post) => [post.id, post])),
          }));
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load linked posts. Reopen the picker to retry.");
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceSlug, selectedIds]);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const res = await client.changelog.relatedPostsSearch.$get({
          slug: workspaceSlug,
          search,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setResults(data.posts);
          setKnown((previous) => ({
            ...previous,
            ...Object.fromEntries(data.posts.map((post) => [post.id, post])),
          }));
        }
      } catch {
        if (!cancelled)
          setError("Could not load posts. Close and reopen to retry.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [workspaceSlug, search, open]);
  const toggle = (id: string) =>
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id],
    );
  const visibleResults = search.trim()
    ? results
    : results.filter((post) => !selectedIds.includes(post.id));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="plain"
          size="sm"
          className="h-7 gap-1.5 rounded-md border-0 bg-black/5 px-2 text-xs text-muted-foreground shadow-none ring-0 before:hidden hover:bg-black/[0.08] hover:text-foreground dark:bg-[#292929] dark:hover:bg-[#303030]"
        >
          <Link2 className="size-3.5" />
          Related posts
          {selectedIds.length ? (
            <span className="text-[10px] tabular-nums text-foreground">
              {selectedIds.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        list
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-80 max-w-[calc(100vw-2rem)] [&>div]:w-full [&_[data-slot=popover-content-inner]]:w-full"
      >
        <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            aria-label="Search related posts"
            placeholder="Link a request…"
            value={search}
            maxLength={200}
            onChange={(event) => setSearch(event.target.value)}
            className="h-7 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <PopoverList
          className="w-full max-h-72 overflow-y-auto overscroll-contain"
          aria-busy={loading}
        >
          {!search.trim() && selectedIds.length > 0 ? (
            <>
              <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Linked · {selectedIds.length}
              </p>
              {selectedIds.map((id) => (
                <PopoverListItem
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  aria-label={`Unlink ${known[id]?.title ?? "post"}`}
                  className="group min-h-9 gap-2 px-3 py-2 text-xs"
                >
                  <StatusIcon
                    status={known[id]?.roadmapStatus ?? undefined}
                    className="size-3.5 shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {known[id]?.title ?? "Linked post"}
                  </span>
                  <X className="size-3 shrink-0 text-muted-foreground opacity-50 group-hover:opacity-100 group-focus-visible:opacity-100" />
                </PopoverListItem>
              ))}
            </>
          ) : null}
          <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {search.trim() ? "Results" : "Link a request"}
          </p>
          {loading ? (
            <div role="status" aria-label="Loading posts" className="py-1">
              {["w-4/5", "w-3/5", "w-2/3", "w-3/4"].map((width, index) => (
                <div
                  key={index}
                  aria-hidden
                  className="flex h-9 items-center gap-2 px-3"
                >
                  <Skeleton className="size-3.5 shrink-0 rounded-full motion-reduce:animate-none" />
                  <Skeleton
                    className={`h-3 ${width} motion-reduce:animate-none`}
                  />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="px-3 py-4 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : visibleResults.length === 0 ? (
            <p className="px-3 py-4 text-xs text-muted-foreground">
              {search.trim()
                ? "No matching requests."
                : "Search for more requests."}
            </p>
          ) : (
            visibleResults.map((post) => {
              const selected = selectedIds.includes(post.id);
              return (
                <PopoverListItem
                  key={post.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={!selected && selectedIds.length >= 20}
                  onClick={() => toggle(post.id)}
                  className="min-h-9 gap-2 px-3 py-2 text-xs disabled:opacity-50"
                >
                  <StatusIcon
                    status={post.roadmapStatus ?? undefined}
                    className="size-3.5 shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate">{post.title}</span>
                  {selected ? (
                    <Check className="size-3.5 shrink-0 text-muted-foreground" />
                  ) : null}
                </PopoverListItem>
              );
            })
          )}
        </PopoverList>
        <p className="border-t border-border/50 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          {selectedIds.length}/20 linked. Only public requests appear on your
          changelog.
        </p>
      </PopoverContent>
    </Popover>
  );
}

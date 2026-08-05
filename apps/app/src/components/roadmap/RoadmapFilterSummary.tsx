"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TrashIcon } from "@featul/ui/icons/trash";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { cn } from "@featul/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { getSlugFromPath } from "@/config/nav";
import { useFilterBarVisibility } from "@/hooks/useFilterBarVisibility";
import {
  buildRoadmapUrl,
  parseRoadmapFiltersFromSearchParams,
} from "@/utils/roadmap-url";
import { SORT_OPTIONS } from "@/types/sort";

export default function RoadmapFilterSummary({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname]);
  const isRoadmapPage = pathname.includes("/roadmap");

  const { board, tag, order, search } = React.useMemo(
    () => parseRoadmapFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const count =
    board.length + tag.length + (order === "oldest" || order === "likes" ? 1 : 0) + (search ? 1 : 0);
  const hasAnyFilters = count > 0;
  const { isVisible, handleClearAll } = useFilterBarVisibility({
    hasAnyFilters,
    buildClearAllHref: () => `/workspaces/${slug}/roadmap`,
  });

  const { data: boardsBySlug = {} } = useQuery({
    queryKey: ["boards-map", slug],
    enabled: !!slug && isRoadmapPage,
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug });
      const data = await res.json();
      const boardsArr = (data?.boards || []).filter(
        (b: { slug: string }) => b?.slug !== "roadmap" && b?.slug !== "changelog",
      );
      const map: Record<string, string> = {};
      for (const b of boardsArr) map[String(b.slug)] = String(b.name || b.slug);
      return map;
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: tagsBySlug = {} } = useQuery({
    queryKey: ["tags-map", slug],
    enabled: !!slug && isRoadmapPage,
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
      const data = await res.json();
      const map: Record<string, string> = {};
      for (const t of data?.tags || []) {
        map[String(t.slug)] = String(t.name || t.slug);
      }
      return map;
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (!isRoadmapPage || !isVisible) return null;

  const removeBoard = (value: string) => {
    router.replace(
      buildRoadmapUrl(slug, searchParams, {
        board: board.filter((item) => item !== value),
      }),
      { scroll: false },
    );
  };

  const removeTag = (value: string) => {
    router.replace(
      buildRoadmapUrl(slug, searchParams, {
        tag: tag.filter((item) => item !== value),
      }),
      { scroll: false },
    );
  };

  const removeOrder = () => {
    router.replace(buildRoadmapUrl(slug, searchParams, { order: "newest" }), {
      scroll: false,
    });
  };

  const removeSearch = () => {
    router.replace(buildRoadmapUrl(slug, searchParams, { search: "" }), {
      scroll: false,
    });
  };

  const orderLabel =
    SORT_OPTIONS.find((option) => option.value === order)?.label || order;

  return (
    <div
      className={cn(
        "bg-white dark:bg-black/60 pointer-events-auto mx-auto flex max-w-[90vw] items-center gap-2 border-t-transparent overflow-hidden rounded-xs shadow-sm px-1 py-0.5 backdrop-blur-lg supports-backdrop-filter:bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border border-border",
        className,
      )}
    >
      {search ? (
        <FilterChip label={`Search: ${search}`} onRemove={removeSearch} />
      ) : null}
      {board.map((value) => (
        <FilterChip
          key={`board-${value}`}
          label={boardsBySlug[value] || value}
          onRemove={() => removeBoard(value)}
        />
      ))}
      {tag.map((value) => (
        <FilterChip
          key={`tag-${value}`}
          label={tagsBySlug[value] || value}
          onRemove={() => removeTag(value)}
        />
      ))}
      {order !== "newest" ? (
        <FilterChip label={orderLabel} onRemove={removeOrder} />
      ) : null}
      <Button
        type="button"
        variant="plain"
        size="icon-sm"
        aria-label="Clear all filters"
        className="ml-auto h-7 w-7 shrink-0 text-accent hover:text-foreground"
        onClick={handleClearAll}
      >
        <TrashIcon className="size-3.5" />
      </Button>
    </div>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-[180px] items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs text-foreground hover:bg-muted/80"
    >
      <span className="truncate">{label}</span>
      <XMarkIcon className="size-3 shrink-0" />
    </button>
  );
}

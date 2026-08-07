"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import {
  WorkspaceSearchAction,
  type WorkspaceSearchResult,
} from "@/components/global/WorkspaceSearchAction";

export interface SearchActionProps {
  slug: string;
  className?: string;
}

export function SearchAction({ slug, className = "" }: SearchActionProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  function buildSearchUrl(nextSearch: string): string {
    const base = pathname || "/";
    const url = new URL(base, "http://dummy");
    searchParams.forEach((v, k) => {
      if (k !== "search") url.searchParams.set(k, v);
    });
    const trimmed = nextSearch.trim();
    if (trimmed) {
      url.searchParams.set("search", trimmed);
    } else {
      url.searchParams.delete("search");
    }
    const query = url.searchParams.toString();
    return `${url.pathname}${query ? `?${query}` : ""}`;
  }

  const runSearch = (value: string) => {
    const href = buildSearchUrl(value);
    router.push(href);
  };

  const clearSearch = () => {
    const href = buildSearchUrl("");
    router.push(href);
  };

  return (
    <WorkspaceSearchAction
      workspaceSlug={slug}
      currentSearch={currentSearch}
      className={cn(
        className,
        currentSearch &&
          "bg-primary/10 ring-1 ring-primary/30 dark:bg-primary/15",
      )}
      buttonVariant="nav"
      placeholder="Search feedback…"
      showNoResults
      onSearchSubmit={runSearch}
      onClearSearch={clearSearch}
      onResultSelect={(result: WorkspaceSearchResult) => {
        router.push(`/board/p/${result.slug}`);
      }}
    />
  );
}

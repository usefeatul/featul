"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import {
  WorkspaceSearchAction,
  type WorkspaceSearchResult,
} from "@/components/global/WorkspaceSearchAction";
import { buildUrlWithSearchParam } from "@/utils/subdomain/url";

export interface SearchActionProps {
  slug: string;
  className?: string;
}

export function SearchAction({ slug, className = "" }: SearchActionProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const runSearch = (value: string) => {
    router.push(buildUrlWithSearchParam(pathname, searchParams, value));
  };

  const clearSearch = () => {
    router.push(buildUrlWithSearchParam(pathname, searchParams, ""));
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

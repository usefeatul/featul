"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@featul/ui/lib/utils";
import { toolbarItemClass } from "@featul/ui/components/toolbar";
import {
  WorkspaceSearchAction,
  type WorkspaceSearchResult,
} from "@/components/global/WorkspaceSearchAction";
import { buildUrlWithSearchParam } from "@/utils/subdomain/url";

export interface SearchActionProps {
  slug: string;
  className?: string;
  /**
   * `toolbar` – icon button that slots into a Toolbar.
   * `field`   – wide search field with placeholder and ⌘K keycap (header / hero).
   */
  appearance?: "toolbar" | "field";
  placeholder?: string;
}

export function SearchAction({
  slug,
  className = "",
  appearance = "toolbar",
  placeholder = "Search feedback…",
}: SearchActionProps) {
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

  const isField = appearance === "field";

  return (
    <WorkspaceSearchAction
      workspaceSlug={slug}
      currentSearch={currentSearch}
      className={cn(
        isField
          ? "h-10 w-full justify-start gap-2.5 px-3.5 text-sm font-normal text-muted-foreground"
          : cn(toolbarItemClass, "px-3"),
        className,
        currentSearch &&
          "bg-primary/10 ring-1 ring-primary/30 dark:bg-primary/15",
      )}
      buttonVariant="card"
      publicOnly
      placeholder={placeholder}
      showLabel={isField}
      showShortcut={isField}
      showNoResults
      onSearchSubmit={runSearch}
      onClearSearch={clearSearch}
      onResultSelect={(result: WorkspaceSearchResult) => {
        router.push(`/board/p/${result.slug}`);
      }}
    />
  );
}

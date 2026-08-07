"use client"

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { Button } from "@featul/ui/components/button";
import type { RequestItemData } from "@/types/request";

import { BoardsDropdown } from "./BoardsDropdown";
import { PublicRequestPagination } from "./PublicRequestPagination";
import { SortPopover } from "./SortPopover";
import { SearchAction } from "./SearchAction";
import { SubmitIdeaCard } from "./SubmitIdeaCard";
import { SubdomainListHeader } from "./SubdomainListHeader";
import { SubdomainListLayout } from "./SubdomainListLayout";
import { SubdomainListCard } from "./SubdomainListCard";
import { SubdomainListItems } from "./SubdomainListItems";
import PostCard from "@/components/subdomain/PostCard";
import { SubdomainListEmptyState } from "./SubdomainListEmptyState";
import EmptyDomainPosts from "./EmptyPosts";

type Item = RequestItemData;

export function MainContent({
  subdomain,
  slug,
  items,
  totalCount,
  page,
  pageSize,
  sidebarPosition = "right",
  initialBoards,
  selectedBoard,
  linkPrefix,
}: {
  subdomain: string;
  slug: string;
  items: Item[];
  totalCount: number;
  page: number;
  pageSize: number;
  sidebarPosition?: "left" | "right";
  initialBoards?: Array<{ id: string; name: string; slug: string; postCount?: number; hidePublicMemberIdentity?: boolean }>;
  selectedBoard?: string;
  linkPrefix?: string;
}) {
  const search = useSearchParams();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const boardParam = search.get("board") || undefined;
  const searchQuery = (search.get("search") || "").trim();
  const paginationBasePath = selectedBoard ? `/board/${selectedBoard}` : "/";
  const paginationKeepParams = selectedBoard
    ? ["order", "search"]
    : ["board", "order", "search"];
  const sortKeepParams = selectedBoard
    ? ["page", "search"]
    : ["page", "board", "search"];
  const [listItems, setListItems] = React.useState<Item[]>(items || []);
  React.useEffect(() => {
    setListItems(items || []);
  }, [items]);
  const orderParam = String(search.get("order") || "likes").toLowerCase();
  const handleVoteChange = React.useCallback((id: string, upvotes: number, hasVoted: boolean) => {
    setListItems((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, upvotes, hasVoted } : p));
      if (orderParam === "likes") {
        next.sort(
          (a, b) =>
            // Pinned posts always first
            (Number(b.isPinned || false) - Number(a.isPinned || false)) ||
            (Number(b.upvotes || 0) - Number(a.upvotes || 0)) ||
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }
      return next;
    });
  }, [orderParam]);

  React.useEffect(() => {
    const handlePostDeleted = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.postId) {
        setListItems((prev) => prev.filter((p) => p.id !== detail.postId));
      }
    };

    window.addEventListener("post:deleted", handlePostDeleted);
    return () => {
      window.removeEventListener("post:deleted", handlePostDeleted);
    };
  }, []);

  const clearSearch = React.useCallback(() => {
    const url = new URL(pathname, "http://dummy");
    search.forEach((value, key) => {
      if (key !== "search") url.searchParams.set(key, value);
    });
    const query = url.searchParams.toString();
    router.push(`${url.pathname}${query ? `?${query}` : ""}`);
  }, [pathname, router, search]);

  return (
    <SubdomainListLayout
      subdomain={subdomain}
      slug={slug}
      sidebarPosition={sidebarPosition}
      initialBoards={initialBoards}
      selectedBoard={selectedBoard || boardParam}
      sortBasePath={paginationBasePath}
      sortKeepParams={sortKeepParams}
    >
      <div>
        <SubdomainListHeader
          sidebarPosition={sidebarPosition}
          mobileActions={
            <>
              <SortPopover
                subdomain={subdomain}
                slug={slug}
                basePath={paginationBasePath}
                keepParams={sortKeepParams}
              />
              <SearchAction slug={slug} />
            </>
          }
          mobileSecondary={
            <BoardsDropdown
              slug={slug}
              initialBoards={initialBoards}
              selectedBoard={selectedBoard || boardParam}
            />
          }
          desktopSecondary={
            <BoardsDropdown
              slug={slug}
              initialBoards={initialBoards}
              selectedBoard={selectedBoard || boardParam}
            />
          }
        />
        <div className="md:hidden mb-4">
          <SubmitIdeaCard subdomain={subdomain} slug={slug} />
        </div>
        {searchQuery ? (
          <div className="mb-3 flex items-center gap-2">
            <Button
              type="button"
              variant="nav"
              size="xs"
              onClick={clearSearch}
              aria-label={`Clear search ${searchQuery}`}
            >
              <span className="truncate">Search: {searchQuery}</span>
              <XMarkIcon className="ml-1 size-3 opacity-60" />
            </Button>
          </div>
        ) : null}
        <SubdomainListCard>
          {items.length === 0 ? (
            searchQuery ? (
              <SubdomainListEmptyState
                title="No results found"
                description={`No posts match "${searchQuery}". Try different keywords or clear your search.`}
              />
            ) : (
              <EmptyDomainPosts subdomain={subdomain} slug={slug} />
            )
          ) : (
            <SubdomainListItems>
              {listItems.map((p) => {
                // Check if the board for this post has hidePublicMemberIdentity enabled
                const postBoard = initialBoards?.find((b) => b.slug === p.boardSlug);
                const hideIdentity = postBoard?.hidePublicMemberIdentity ?? false;
                return (
                  <PostCard key={p.id} item={p} onVoteChange={handleVoteChange} linkPrefix={linkPrefix} hidePublicMemberIdentity={hideIdentity} />
                );
              })}
            </SubdomainListItems>
          )}
        </SubdomainListCard>
        <PublicRequestPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          basePath={paginationBasePath}
          keepParams={paginationKeepParams}
        />
      </div>
    </SubdomainListLayout>
  );
}

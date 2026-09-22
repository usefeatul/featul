"use client"

import React from "react";
import { useSearchParams } from "next/navigation";
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
import { SubdomainActiveSearchHeader } from "./SubdomainActiveSearchHeader";
import EmptyDomainPosts from "./EmptyPosts";
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar";

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
            <Toolbar size="sm" className="w-fit">
              <SortPopover
                subdomain={subdomain}
                slug={slug}
                basePath={paginationBasePath}
                keepParams={sortKeepParams}
              />
              <ToolbarSeparator />
              <SearchAction slug={slug} />
            </Toolbar>
          }
          mobileSecondary={
            <Toolbar size="sm" className="w-fit">
              <BoardsDropdown
                slug={slug}
                initialBoards={initialBoards}
                selectedBoard={selectedBoard || boardParam}
              />
            </Toolbar>
          }
          desktopSecondary={
            <Toolbar size="sm" className="w-fit">
              <BoardsDropdown
                slug={slug}
                initialBoards={initialBoards}
                selectedBoard={selectedBoard || boardParam}
              />
            </Toolbar>
          }
        />
        <div className="md:hidden mb-4">
          <SubmitIdeaCard subdomain={subdomain} slug={slug} />
        </div>
        <SubdomainListCard>
          {searchQuery ? (
            <SubdomainActiveSearchHeader
              query={searchQuery}
              totalCount={totalCount}
            />
          ) : null}
          {items.length === 0 ? (
            searchQuery ? (
              <SubdomainListEmptyState
                title="No results found"
                description="Try different keywords or clear your search."
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

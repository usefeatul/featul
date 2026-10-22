"use client"

import React from "react";
import { useSearchParams } from "next/navigation";
import type { RequestItemData } from "@/types/request";

import { BoardsDropdown } from "./BoardsDropdown";
import { PublicRequestPagination } from "./PublicRequestPagination";
import { FeedbackListHeader } from "./FeedbackListHeader";
import { SubdomainListLayout } from "./SubdomainListLayout";
import { SubdomainListCard } from "./SubdomainListCard";
import { SubdomainListItems } from "./SubdomainListItems";
import PostCard from "@/components/subdomain/PostCard";
import { SubdomainListEmptyState } from "./SubdomainListEmptyState";
import { SubdomainActiveSearchHeader } from "./SubdomainActiveSearchHeader";
import EmptyDomainPosts from "./EmptyPosts";
import { Toolbar } from "@featul/ui/components/toolbar";
import { parseRoadmapStatusFilter } from "@/utils/subdomain/status";

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
  const selectedStatuses = parseRoadmapStatusFilter(search.get("status"));
  const paginationBasePath = selectedBoard ? `/board/${selectedBoard}` : "/";
  const paginationKeepParams = selectedBoard
    ? ["order", "search", "status"]
    : ["board", "order", "search", "status"];
  const sortKeepParams = selectedBoard
    ? ["page", "search", "status"]
    : ["page", "board", "search", "status"];
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

  const activeBoard = selectedBoard || boardParam;

  return (
    <SubdomainListLayout
      subdomain={subdomain}
      slug={slug}
      sidebarPosition={sidebarPosition}
      initialBoards={initialBoards}
      selectedBoard={activeBoard}
      sortBasePath={paginationBasePath}
      sortKeepParams={sortKeepParams}
    >
      <div>
        <FeedbackListHeader
          basePath={paginationBasePath}
          keepParams={sortKeepParams}
          leading={
            <Toolbar size="sm" className="w-fit md:hidden">
              <BoardsDropdown slug={slug} initialBoards={initialBoards} selectedBoard={activeBoard} />
            </Toolbar>
          }
        />

        <SubdomainListCard className="border-t-0">
          {searchQuery ? (
            <SubdomainActiveSearchHeader query={searchQuery} totalCount={totalCount} />
          ) : null}
          {items.length === 0 ? (
            searchQuery ? (
              <SubdomainListEmptyState
                mood="search"
                title="No results found"
                description="Try different keywords or clear your search."
              />
            ) : selectedStatuses.length > 0 ? (
              <SubdomainListEmptyState
                mood="search"
                title="No posts found"
                description="Try another roadmap status or clear the filter."
              />
            ) : (
              <EmptyDomainPosts subdomain={subdomain} slug={slug} />
            )
          ) : (
            <SubdomainListItems>
              {listItems.map((p) => {
                const postBoard = initialBoards?.find((b) => b.slug === p.boardSlug);
                const hideIdentity = postBoard?.hidePublicMemberIdentity ?? false;
                return (
                  <PostCard
                    key={p.id}
                    item={p}
                    onVoteChange={handleVoteChange}
                    linkPrefix={linkPrefix}
                    hidePublicMemberIdentity={hideIdentity}
                    showBoard={!activeBoard}
                  />
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

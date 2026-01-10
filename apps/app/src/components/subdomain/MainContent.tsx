"use client"

import React from "react";
import { useSearchParams } from "next/navigation";
import type { RequestItemData } from "@/components/requests/RequestItem";

import { BoardsDropdown } from "./BoardsDropdown";
import { PublicRequestPagination } from "./PublicRequestPagination";
import { DomainSidebar } from "./DomainSidebar";
import { SortPopover } from "./SortPopover";
import { SearchAction } from "./SearchAction";
import { SubmitIdeaCard } from "./SubmitIdeaCard";
import PostCard from "@/components/subdomain/PostCard";
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
    <section>
      <div
        className={
          sidebarPosition === "left"
            ? "grid md:grid-cols-[0.3fr_0.7fr] gap-6 mb-6"
            : "grid md:grid-cols-[0.7fr_0.3fr] gap-6 mb-6"
        }
      >
        {sidebarPosition === "left" ? (
          <aside className="hidden lg:block mt-10 lg:mt-0">
            <DomainSidebar
              subdomain={subdomain}
              slug={slug}
              initialBoards={initialBoards}
              selectedBoard={selectedBoard}
            />
          </aside>
        ) : null}
        <div>
          <div className="mb-4">
            {sidebarPosition === "left" ? (
              <div className="lg:hidden flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <SortPopover subdomain={subdomain} slug={slug} />
                  <SearchAction slug={slug} />
                </span>
                <BoardsDropdown
                  slug={slug}
                  subdomain={subdomain}
                  initialBoards={initialBoards}
                  selectedBoard={selectedBoard}
                />
              </div>
            ) : (
              <div className="lg:hidden flex items-center justify-between gap-2">
                <BoardsDropdown
                  slug={slug}
                  subdomain={subdomain}
                  initialBoards={initialBoards}
                  selectedBoard={selectedBoard}
                />
                <span className="inline-flex items-center gap-2">
                  <SortPopover subdomain={subdomain} slug={slug} />
                  <SearchAction slug={slug} />
                </span>
              </div>
            )}
            <div
              className={
                sidebarPosition === "left"
                  ? "hidden lg:flex items-center justify-end"
                  : "hidden lg:flex items-center justify-start"
              }
            >
              <BoardsDropdown
                slug={slug}
                subdomain={subdomain}
                initialBoards={initialBoards}
                selectedBoard={selectedBoard}
              />
            </div>
          </div>
          <div className="lg:hidden mb-4">
            <SubmitIdeaCard subdomain={subdomain} slug={slug} />
          </div>
          <div className="rounded-md ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border bg-card mt-4">
            {items.length === 0 ? (
              <EmptyDomainPosts subdomain={subdomain} slug={slug} />
            ) : (
              <div className="divide-y">
                {listItems.map((p) => {
                  // Check if the board for this post has hidePublicMemberIdentity enabled
                  const postBoard = initialBoards?.find((b) => b.slug === p.boardSlug);
                  const hideIdentity = postBoard?.hidePublicMemberIdentity ?? false;
                  return (
                    <PostCard key={p.id} item={p} onVoteChange={handleVoteChange} linkPrefix={linkPrefix} hidePublicMemberIdentity={hideIdentity} />
                  );
                })}
              </div>
            )}
          </div>
          <PublicRequestPagination
            subdomain={subdomain}
            slug={slug}
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
          />
        </div>
        {sidebarPosition === "right" ? (
          <aside className="hidden lg:block mt-10 lg:mt-0">
            <DomainSidebar
              subdomain={subdomain}
              slug={slug}
              initialBoards={initialBoards}
              selectedBoard={selectedBoard}
            />
          </aside>
        ) : null}
      </div>
    </section>
  );
}

import React from "react";

import { BoardsDropdown } from "./BoardsDropdown";
import { PublicRequestPagination } from "./PublicRequestPagination";
import { DomainSidebar } from "./DomainSidebar";
import { SortPopover } from "./SortPopover";
import { SearchAction } from "./SearchAction";
import { SubmitIdeaCard } from "./SubmitIdeaCard";
import PostCard from "@/components/domain/PostCard";
import EmptyDomainPosts from "./EmptyPosts";

type Item = any;

export function MainContent({
  subdomain,
  slug,
  items,
  totalCount,
  page,
  pageSize,
  sidebarPosition = "right",
}: {
  subdomain: string;
  slug: string;
  items: Item[];
  totalCount: number;
  page: number;
  pageSize: number;
  sidebarPosition?: "left" | "right";
}) {
  return (
    <section>
      <div
        className={
          sidebarPosition === "left"
            ? "lg:grid lg:grid-cols-[250px_minmax(0,1.5fr)] lg:gap-6"
            : "lg:grid lg:grid-cols-[minmax(0,1.5fr)_250px] lg:gap-6"
        }
      >
        {sidebarPosition === "left" ? (
          <aside className="hidden lg:block mt-10 lg:mt-0">
            <DomainSidebar subdomain={subdomain} slug={slug} />
          </aside>
        ) : null}
        <div>
          <div className="mb-4">
            {sidebarPosition === "left" ? (
              <div className="lg:hidden flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1">
                  <SortPopover subdomain={subdomain} slug={slug} />
                  <SearchAction />
                </span>
                <BoardsDropdown slug={slug} subdomain={subdomain} />
              </div>
            ) : (
              <div className="lg:hidden flex items-center justify-between gap-2">
                <BoardsDropdown slug={slug} subdomain={subdomain} />
                <span className="inline-flex items-center gap-1">
                  <SortPopover subdomain={subdomain} slug={slug} />
                  <SearchAction />
                </span>
              </div>
            )}
            <div className={sidebarPosition === "left" ? "hidden lg:flex items-center justify-end" : "hidden lg:flex items-center justify-start"}>
              <BoardsDropdown slug={slug} subdomain={subdomain} />
            </div>
          </div>
          <div className="lg:hidden mb-4">
            <SubmitIdeaCard subdomain={subdomain} slug={slug} />
          </div>
          <div className="rounded-md border bg-card mt-4">
            {(items as any[]).length === 0 ? (
              <EmptyDomainPosts subdomain={subdomain} slug={slug} />
            ) : (
              <div className="divide-y">
                {(items as any[]).map((p: any) => (
                  <PostCard key={p.id} item={p} />
                ))}
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
            <DomainSidebar subdomain={subdomain} slug={slug} />
          </aside>
        ) : null}
      </div>
    </section>
  );
}

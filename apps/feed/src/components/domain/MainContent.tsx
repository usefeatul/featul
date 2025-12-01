import React from "react"
import RequestList from "@/components/requests/RequestList"
import { BoardsDropdown } from "./BoardsDropdown"
import { PublicRequestPagination } from "./PublicRequestPagination"
import { DomainSidebar } from "./DomainSidebar"
import { SortPopover } from "./SortPopover"
import { SearchAction } from "./SearchAction"
import { SubmitIdeaCard } from "./SubmitIdeaCard"

type Item = any

export function MainContent({
  subdomain,
  slug,
  items,
  totalCount,
  page,
  pageSize,
}: {
  subdomain: string
  slug: string
  items: Item[]
  totalCount: number
  page: number
  pageSize: number
}) {
  return (
    <section>
      <div className="lg:grid lg:grid-cols-[minmax(0,1.5fr)_250px] lg:gap-6">
        <div>
          <div className="mb-4">
            <div className="lg:hidden flex items-center justify-between gap-2">
              <BoardsDropdown slug={slug} subdomain={subdomain} />
              <span className="inline-flex items-center gap-1">
                <SortPopover subdomain={subdomain} slug={slug} />
                <SearchAction />
              </span>
            </div>
            <div className="hidden lg:flex items-center justify-start">
              <BoardsDropdown slug={slug} subdomain={subdomain} />
            </div>
          </div>
          <div className="lg:hidden mb-4">
            <SubmitIdeaCard subdomain={subdomain} slug={slug} />
          </div>
          <RequestList items={items as any} workspaceSlug={slug} linkBase={`/${subdomain}/${slug}`} />
          <PublicRequestPagination subdomain={subdomain} slug={slug} page={page} pageSize={pageSize} totalCount={totalCount} />
        </div>
        <aside className="hidden lg:block mt-10 lg:mt-0">
          <DomainSidebar subdomain={subdomain} slug={slug} />
        </aside>
      </div>
    </section>
  )
}

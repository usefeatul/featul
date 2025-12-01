import React from "react"
import RequestList from "@/components/requests/RequestList"
import { BoardsDropdown } from "./BoardsDropdown"
import { PublicRequestPagination } from "./PublicRequestPagination"
import { DomainSidebar } from "./DomainSidebar"

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
    <section className="mt-2">
      <div className="lg:grid lg:grid-cols-[minmax(0,1.5fr)_250px] lg:gap-6">
        <div>
          <div className="mb-4 flex items-center justify-start">
            <BoardsDropdown slug={slug} subdomain={subdomain} />
          </div>
          <RequestList items={items as any} workspaceSlug={slug} linkBase={`/${subdomain}/${slug}`} />
          <PublicRequestPagination subdomain={subdomain} slug={slug} page={page} pageSize={pageSize} totalCount={totalCount} />
        </div>
        <aside className="mt-10 lg:mt-0">
          <DomainSidebar subdomain={subdomain} slug={slug} />
        </aside>
      </div>
    </section>
  )
}

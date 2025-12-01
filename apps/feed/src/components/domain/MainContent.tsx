import React from "react"
import RequestList from "@/components/requests/RequestList"
import { BoardsDropdown } from "./BoardsDropdown"
import { PublicRequestPagination } from "./PublicRequestPagination"
import { SubmitIdeaCard } from "./SubmitIdeaCard"
import { BoardsList } from "./BoardsList"
import { SortPopover } from "./SortPopover"
import { SearchAction } from "./SearchAction"

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
    <section className="mt-4">
      <div className="lg:grid lg:grid-cols-[minmax(0,1.5fr)_280px] lg:gap-10">
        <div>
          <div className="mb-4 flex items-center justify-start">
            <BoardsDropdown slug={slug} subdomain={subdomain} />
          </div>
          <RequestList items={items as any} workspaceSlug={slug} linkBase={`/${subdomain}/${slug}`} />
          <PublicRequestPagination subdomain={subdomain} slug={slug} page={page} pageSize={pageSize} totalCount={totalCount} />
        </div>
        <aside className="mt-10 lg:mt-0 space-y-4">
          <div className="flex items-center justify-end gap-1">
            <SortPopover subdomain={subdomain} slug={slug} />
            <SearchAction />
          </div>
          <SubmitIdeaCard subdomain={subdomain} slug={slug} />
          <BoardsList subdomain={subdomain} slug={slug} />
          <div className="pt-2 text-center">
            <span className="rounded-md bg-muted px-3 py-1 text-xs text-accent">Powered by UserJot</span>
          </div>
        </aside>
      </div>
    </section>
  )
}

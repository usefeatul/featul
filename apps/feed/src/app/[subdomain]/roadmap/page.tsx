export const revalidate = 30

import type { Metadata } from "next"
import DomainPageLayout from "@/components/subdomain/DomainPageLayout"
import DomainRoadmapItem from "@/components/subdomain/DomainRoadmapItem"
import { getPlannedRoadmapPosts, getSidebarPositionBySlug, getWorkspacePostsCount } from "@/lib/workspace"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import EmptyDomainPosts from "@/components/subdomain/EmptyPosts"
import { SortPopover } from "@/components/subdomain/SortPopover"
import { SearchAction } from "@/components/subdomain/SearchAction"
import { SubmitIdeaCard } from "@/components/subdomain/SubmitIdeaCard"
import { PublicRequestPagination } from "@/components/subdomain/PublicRequestPagination"

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params
  return createWorkspaceSectionMetadata(subdomain, "roadmap")
}

const PAGE_SIZE = 20

export default async function RoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>
  searchParams?: Promise<{ page?: string; order?: "newest" | "oldest" }>
}) {
  const { subdomain } = await params
  const sp = (await searchParams) || {}
  const slug = subdomain
  const page = Math.max(1, Number(sp.page ?? "1") || 1)
  const offset = (page - 1) * PAGE_SIZE
  const order = sp.order === "oldest" ? "oldest" : "newest"

  const items = await getPlannedRoadmapPosts(slug, { limit: PAGE_SIZE, offset, order })
  const totalCount = await getWorkspacePostsCount(slug, { statuses: ["planned"], publicOnly: true })
  const sidebarPosition = await getSidebarPositionBySlug(slug)
  return (
    <DomainPageLayout subdomain={subdomain} slug={slug} sidebarPosition={sidebarPosition}>
      <div>
        {sidebarPosition === "left" ? (
          <>
            <div className="hidden lg:flex items-center justify-end mb-5">
              <h1 className="text-lg font-semibold">Roadmap</h1>
            </div>
            <div className="lg:hidden mb-4">
              <div className="flex items-center justify-end">
                <h1 className="text-lg font-semibold">Roadmap</h1>
              </div>
              <div className="mt-2 inline-flex items-center gap-1">
                <SortPopover subdomain={subdomain} slug={slug} />
                <SearchAction slug={slug} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="lg:hidden flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <SortPopover subdomain={subdomain} slug={slug} />
                <SearchAction slug={slug} />
              </span>
            </div>
            <h1 className="text-lg font-semibold mb-5">Roadmap</h1>
          </>
        )}
        <div className="lg:hidden mb-4">
          <SubmitIdeaCard subdomain={subdomain} slug={slug} />
        </div>
        <div className="rounded-md  border bg-card mt-4">
          {(items || []).length === 0 ? (
            <EmptyDomainPosts subdomain={subdomain} slug={slug} />
          ) : (
            <div className="divide-y">
              {(items || []).map((it) => (
                <DomainRoadmapItem
                  key={it.id}
                  item={{ id: it.id, title: it.title, slug: it.slug, roadmapStatus: it.roadmapStatus, content: it.content, boardSlug: it.boardSlug }}
                />
              ))}
            </div>
          )}
        </div>
        <PublicRequestPagination subdomain={subdomain} slug={slug} page={page} pageSize={PAGE_SIZE} totalCount={totalCount} />
      </div>
    </DomainPageLayout>
  )
}

export const revalidate = 30

import type { Metadata } from "next"
import DomainRoadmapItem from "@/components/subdomain/DomainRoadmapItem"
import { getPlannedRoadmapPosts, getSidebarPositionBySlug, getWorkspacePostsCount } from "@/lib/workspace"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import EmptyDomainPosts from "@/components/subdomain/EmptyPosts"
import { SortPopover } from "@/components/subdomain/SortPopover"
import { SearchAction } from "@/components/subdomain/SearchAction"
import { SubmitIdeaCard } from "@/components/subdomain/SubmitIdeaCard"
import { PublicRequestPagination } from "@/components/subdomain/PublicRequestPagination"
import { SubdomainListLayout } from "@/components/subdomain/SubdomainListLayout"
import { SubdomainListHeader } from "@/components/subdomain/SubdomainListHeader"
import { SubdomainListCard } from "@/components/subdomain/SubdomainListCard"
import { SubdomainListItems } from "@/components/subdomain/SubdomainListItems"

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
    <SubdomainListLayout
      subdomain={subdomain}
      slug={slug}
      sidebarPosition={sidebarPosition}
      sortBasePath="/roadmap"
      sortKeepParams={["page"]}
    >
      <div>
        <SubdomainListHeader
          title="Roadmap"
          sidebarPosition={sidebarPosition}
          mobileTitlePosition={sidebarPosition === "left" ? "top" : "bottom"}
          breakpoint="lg"
          mobileActions={
            <>
              <SortPopover
                subdomain={subdomain}
                slug={slug}
                basePath="/roadmap"
                keepParams={["page"]}
              />
              <SearchAction slug={slug} />
            </>
          }
        />
        <div className="lg:hidden mb-4">
          <SubmitIdeaCard subdomain={subdomain} slug={slug} />
        </div>
        <SubdomainListCard>
          {(items || []).length === 0 ? (
            <EmptyDomainPosts subdomain={subdomain} slug={slug} />
          ) : (
            <SubdomainListItems>
              {(items || []).map((it) => (
                <DomainRoadmapItem
                  key={it.id}
                  item={{ id: it.id, title: it.title, slug: it.slug, roadmapStatus: it.roadmapStatus, content: it.content, boardSlug: it.boardSlug }}
                />
              ))}
            </SubdomainListItems>
          )}
        </SubdomainListCard>
        <PublicRequestPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          basePath="/roadmap"
          keepParams={["order"]}
        />
      </div>
    </SubdomainListLayout>
  )
}

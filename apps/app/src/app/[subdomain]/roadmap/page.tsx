export const revalidate = 30

import type { Metadata } from "next"
import RoadmapBoard from "@/components/roadmap/RoadmapBoard"
import { getSidebarPositionBySlug, getWorkspacePosts, getWorkspacePostsCount } from "@/lib/workspace"
import { toRequestItemData } from "@/lib/request-item"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import EmptyDomainPosts from "@/components/subdomain/EmptyPosts"
import { SearchAction } from "@/components/subdomain/SearchAction"
import { SubmitIdeaCard } from "@/components/subdomain/SubmitIdeaCard"
import { SubdomainListLayout } from "@/components/subdomain/SubdomainListLayout"
import { SubdomainListHeader } from "@/components/subdomain/SubdomainListHeader"
import { ROADMAP_PAGE_SIZE } from "@/lib/roadmap"

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params
  return createWorkspaceSectionMetadata(subdomain, "roadmap")
}

const PUBLIC_ROADMAP_STATUSES = ["planned", "progress", "review", "completed"]

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const slug = subdomain

  const [rows, totalCount, sidebarPosition] = await Promise.all([
    getWorkspacePosts(slug, {
      statuses: PUBLIC_ROADMAP_STATUSES,
      limit: ROADMAP_PAGE_SIZE,
      publicOnly: true,
    }),
    getWorkspacePostsCount(slug, {
      statuses: PUBLIC_ROADMAP_STATUSES,
      publicOnly: true,
    }),
    getSidebarPositionBySlug(slug),
  ])

  const items = rows.map(toRequestItemData)

  return (
    <SubdomainListLayout
      subdomain={subdomain}
      slug={slug}
      sidebarPosition={sidebarPosition}
      sortBasePath="/roadmap"
      sortKeepParams={[]}
    >
      <div>
        <SubdomainListHeader
          title="Roadmap"
          sidebarPosition={sidebarPosition}
          mobileTitlePosition={sidebarPosition === "left" ? "top" : "bottom"}
          breakpoint="lg"
          mobileActions={<SearchAction slug={slug} />}
        />
        <div className="mb-4 lg:hidden">
          <SubmitIdeaCard subdomain={subdomain} slug={slug} />
        </div>
        {items.length === 0 ? (
          <EmptyDomainPosts subdomain={subdomain} slug={slug} />
        ) : (
          <RoadmapBoard
            workspaceSlug={slug}
            items={items}
            totalCount={totalCount}
            readOnly
            linkBase="/p"
          />
        )}
      </div>
    </SubdomainListLayout>
  )
}

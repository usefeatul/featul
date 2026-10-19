export const revalidate = 30

import type { Metadata } from "next"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getRoadmapColumnPosts, getWorkspacePostsCount } from "@/lib/workspace"
import { readHasVotedForPost } from "@/lib/vote.server"
import { toRequestItemData } from "@/lib/request/item"
import { resolveSearchParams } from "@/utils/search/params"
import { RoadmapColumn, type RoadmapColumnStatus } from "@/components/subdomain/RoadmapColumn"
import { SubdomainActiveSearchHeader } from "@/components/subdomain/SubdomainActiveSearchHeader"
import type { RequestItemData } from "@/types/request"
import { PortalPageHeader } from "@/components/subdomain/PortalPageHeader"
import { PoweredBy } from "@/components/subdomain/PoweredBy"
import { ShareIdeaButton } from "@/components/subdomain/ShareIdeaButton"

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params
  return createWorkspaceSectionMetadata(subdomain, "roadmap")
}

const COLUMNS: RoadmapColumnStatus[] = ["planned", "progress", "completed"]
const COLUMN_LIMIT = 30

export default async function RoadmapPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>
  searchParams?: Promise<{ search?: string }>
}) {
  const { subdomain } = await params
  const sp = (await resolveSearchParams(searchParams)) ?? {}
  const search = (sp.search || "").trim()

  const columns = await Promise.all(
    COLUMNS.map(async (status) => {
      const [rows, totalCount] = await Promise.all([
        getRoadmapColumnPosts(subdomain, status, { limit: COLUMN_LIMIT, search: search || undefined }),
        getWorkspacePostsCount(subdomain, { statuses: [status], search: search || undefined, publicOnly: true }),
      ])
      const items: RequestItemData[] = await Promise.all(
        rows.map(async (r) =>
          toRequestItemData({ ...r, hasVoted: await readHasVotedForPost(r.id) })
        )
      )
      return { status, items, totalCount }
    })
  )

  const matched = columns.reduce((sum, c) => sum + c.totalCount, 0)

  return (
    <section className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PortalPageHeader />
        <ShareIdeaButton className="mb-4 w-full sm:w-auto" />
      </div>
      {search ? (
        <div className="mb-4 overflow-hidden rounded-xl border border-border/60 bg-card dark:border-white/[0.07]">
          <SubdomainActiveSearchHeader query={search} totalCount={matched} />
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((c) => (
          <RoadmapColumn key={c.status} status={c.status} items={c.items} totalCount={c.totalCount} />
        ))}
      </div>
      <PoweredBy />
    </section>
  )
}

export const revalidate = 30

import type { Metadata } from "next"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getSidebarPositionBySlug } from "@/lib/workspace"
import { client } from "@featul/api/client"
import { ChangelogCard } from "@/components/subdomain/ChangelogCard"
import { ChangelogSubscribeBar } from "@/components/subdomain/changelog/ChangelogSubscribeBar"
import type { ChangelogEntriesListResponse, ChangelogEntry } from "@/types/changelog"
import { SubdomainListLayout } from "@/components/subdomain/SubdomainListLayout"
import { PublicRequestPagination } from "@/components/subdomain/PublicRequestPagination"
import { SubdomainListEmptyState } from "@/components/subdomain/SubdomainListEmptyState"
import {
  parsePositiveIntSearchParam,
  resolveSearchParams,
} from "@/utils/search/params"

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params
  return createWorkspaceSectionMetadata(subdomain, "changelog")
}

const PAGE_SIZE = 10

export default async function ChangelogPage({
  params,
  searchParams,
}: {
  params: Promise<{ subdomain: string }>
  searchParams?: Promise<{ page?: string }>
}) {
  const { subdomain } = await params
  const sp = (await resolveSearchParams(searchParams)) ?? {}
  const page = parsePositiveIntSearchParam(sp.page)
  const offset = (page - 1) * PAGE_SIZE
  const slug = subdomain
  const sidebarPosition = await getSidebarPositionBySlug(slug)
  const res = await client.changelog.entriesList.$get({ slug, limit: PAGE_SIZE, offset })
  const d = await res.json() as ChangelogEntriesListResponse
  const entries: ChangelogEntry[] = (d.entries || []).map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    summary: e.summary,
    content: e.content,
    coverImage: e.coverImage,
    publishedAt: e.publishedAt,
    author: e.author,
    tags: Array.isArray(e.tags) ? e.tags : []
  }))
  const totalCount = Number(d.total || entries.length)

  return (
    <SubdomainListLayout
      subdomain={subdomain}
      slug={slug}
      sidebarPosition={sidebarPosition}
      hideBoards
      hideSidebar
    >
      <div className="flex flex-1 flex-col">
        <ChangelogSubscribeBar slug={slug} totalCount={totalCount} />

        {entries.length === 0 ? (
          <div className="flex flex-1 flex-col">
            <SubdomainListEmptyState
              title="No changelog entries yet"
              description="Check back soon for updates."
            />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border/60 dark:divide-white/[0.07] [&>*]:py-12 [&>*:first-child]:pt-0">
            {entries.map((entry) => (
              <ChangelogCard key={entry.id} item={entry} linkPrefix="/changelog/p" />
            ))}
          </div>
        )}

        <PublicRequestPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          basePath="/changelog"
          keepParams={[]}
        />
      </div>
    </SubdomainListLayout>
  )
}

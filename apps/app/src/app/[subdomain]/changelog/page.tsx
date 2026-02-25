export const revalidate = 30

import type { Metadata } from "next"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getSidebarPositionBySlug } from "@/lib/workspace"
import { client } from "@featul/api/client"
import { ChangelogCard } from "@/components/subdomain/ChangelogCard"
import type { ChangelogEntriesListResponse, ChangelogEntry } from "@/types/changelog"
import { SubdomainListLayout } from "@/components/subdomain/SubdomainListLayout"
import { SubdomainListHeader } from "@/components/subdomain/SubdomainListHeader"
import { PublicRequestPagination } from "@/components/subdomain/PublicRequestPagination"
import { SubdomainListCard } from "@/components/subdomain/SubdomainListCard"
import { SubdomainListEmptyState } from "@/components/subdomain/SubdomainListEmptyState"
import { SubdomainListItems } from "@/components/subdomain/SubdomainListItems"

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
  const sp = (await searchParams) || {}
  const page = Math.max(1, Number(sp.page ?? "1") || 1)
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
      hideSubmitButton={false}
      hideBoards={true}
      sortBasePath="/changelog"
      sortKeepParams={["page"]}
    >
      <div>
        <SubdomainListHeader title="Changelog" sidebarPosition={sidebarPosition} />
        <SubdomainListCard>
          {entries.length === 0 ? (
            <SubdomainListEmptyState
              title="No changelog entries yet"
              description="Check back soon for updates."
            />
          ) : (
            <SubdomainListItems>
              {entries.map((entry) => (
                <ChangelogCard key={entry.id} item={entry} linkPrefix="/changelog/p" />
              ))}
            </SubdomainListItems>
          )}
        </SubdomainListCard>
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

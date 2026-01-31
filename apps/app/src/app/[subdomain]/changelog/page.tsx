export const revalidate = 30

import type { Metadata } from "next"
import DomainPageLayout from "@/components/subdomain/DomainPageLayout"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getSidebarPositionBySlug } from "@/lib/workspace"
import { client } from "@featul/api/client"
import { ChangelogCard } from "@/components/subdomain/ChangelogCard"

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params
  return createWorkspaceSectionMetadata(subdomain, "changelog")
}

export default async function ChangelogPage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params
  const slug = subdomain
  const sidebarPosition = await getSidebarPositionBySlug(slug)
  const res = await client.changelog.entriesList.$get({ slug })
  const d = await res.json()
  const entries = ((d as any)?.entries || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    summary: e.summary,
    content: e.content,
    coverImage: e.coverImage,
    slug: e.slug,
    publishedAt: e.publishedAt,
    author: e.author,
    tags: Array.isArray(e.tags) ? e.tags : []
  }))

  return (
    <DomainPageLayout subdomain={subdomain} slug={slug} sidebarPosition={sidebarPosition} hideSubmitButton={true}>
      <div>
        <h1 className="text-lg font-semibold mb-4">Changelog</h1>
        <div className="rounded-md ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black border bg-card">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p>No changelog entries yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {entries.map((e: any) => (
                <ChangelogCard key={e.id} item={e} linkPrefix="/changelog/p" />
              ))}
            </div>
          )}
        </div>
      </div>
    </DomainPageLayout>
  )
}

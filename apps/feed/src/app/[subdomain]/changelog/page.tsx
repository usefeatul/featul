export const revalidate = 30

import type { Metadata } from "next"
import DomainPageLayout from "@/components/subdomain/DomainPageLayout"
import { createWorkspaceSectionMetadata } from "@/lib/seo"
import { getSidebarPositionBySlug } from "@/lib/workspace"
import { client } from "@oreilla/api/client"

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
  const entries = ((d as any)?.entries || []).map((e: any) => ({ id: e.id, title: e.title, summary: e.summary, date: e.publishedAt, tags: Array.isArray(e.tags) ? e.tags : [] }))
  return (
    <DomainPageLayout subdomain={subdomain} slug={slug} sidebarPosition={sidebarPosition} hideSubmitButton={true}>
      <div>
        <h1 className="text-lg font-semibold mb-4">Changelog</h1>
        <div className="space-y-4">
          {entries.map((e: any) => (
            <article key={e.id} className="rounded-md  border bg-card p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{e.title}</h2>
                {e.date ? (
                  <time className="text-xs text-accent" dateTime={e.date}>{new Date(e.date).toLocaleDateString()}</time>
                ) : null}
              </div>
              {e.summary ? <p className="text-sm text-accent mt-2">{e.summary}</p> : null}
              {e.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {e.tags.map((t: any) => (
                    <span key={t.id} className="text-xs rounded-md  bg-muted px-2 py-0.5 text-accent">{t.name}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </DomainPageLayout>
  )
}

import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { client } from "@oreilla/api/client"

export const revalidate = 30

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Changelog",
    description: "Workspace changelog",
    path: `/workspaces/${slug}/changelog`,
    indexable: false,
  })
}

export default async function ChangelogPage({ params }: Props) {
  const { slug } = await params
  const res = await client.changelog.entriesList.$get({ slug })
  const d = await res.json()
  const entries = ((d as any)?.entries || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    summary: e.summary,
    date: e.publishedAt,
    tags: Array.isArray(e.tags) ? e.tags : [],
  }))

  return (
    <section className="space-y-4">
      <div className="space-y-4">
        {entries.map((e: any) => (
          <article key={e.id} className="rounded-md border bg-card p-4">
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
                  <span key={t.id} className="text-[11px] rounded-md bg-muted px-2 py-0.5 text-accent">{t.name}</span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

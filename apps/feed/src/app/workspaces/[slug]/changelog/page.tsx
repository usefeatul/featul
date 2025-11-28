import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

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

  const entries = [
    {
      date: "2025-11-15",
      title: "Workspace theming",
      summary: "Brand colors, logo upload, and light/dark themes.",
      tags: ["Branding", "UI"],
    },
    {
      date: "2025-11-02",
      title: "Changelog announcements",
      summary: "Publish release notes with categories and links.",
      tags: ["Changelog"],
    },
    {
      date: "2025-10-28",
      title: "Board improvements",
      summary: "Tags, sorting, and better post details view.",
      tags: ["Board"],
    },
  ]

  return (
    <section className="space-y-4">
      <div className="space-y-4">
        {entries.map((e) => (
          <article key={`${e.date}-${e.title}`} className="rounded-md border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">{e.title}</h2>
              <time className="text-xs text-accent" dateTime={e.date}>{new Date(e.date).toLocaleDateString()}</time>
            </div>
            <p className="text-sm text-accent mt-2">{e.summary}</p>
            {e.tags?.length ? (
              <div className="mt-3 flex flex-wrap gap-1">
                {e.tags.map((t) => (
                  <span key={t} className="text-[11px] rounded-md bg-muted px-2 py-0.5 text-accent">{t}</span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

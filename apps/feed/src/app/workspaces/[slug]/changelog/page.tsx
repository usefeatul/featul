import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { client } from "@oreilla/api/client"
import { ChangelogEntryList } from "@/components/changelog/changelog-entry-list"

export const revalidate = 30

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Changelog",
    description: "Product updates and announcements",
    path: `/workspaces/${slug}/changelog`,
    indexable: false,
  })
}

export default async function ChangelogPage({ params }: Props) {
  const { slug } = await params
  
  // Fetch entries for initial render (public entries)
  const res = await client.changelog.entriesList.$get({ slug, limit: 20 })
  const data = await res.json()
  const entries = (data as any)?.entries || []
  const total = (data as any)?.total || 0

  return (
    <section className="max-w-4xl mx-auto py-6">
      <ChangelogEntryList
        slug={slug}
        initialEntries={entries}
        initialTotal={total}
      />
    </section>
  )
}

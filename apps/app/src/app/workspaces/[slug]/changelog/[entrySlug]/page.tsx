import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { client } from "@featul/api/client"

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string; entrySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, entrySlug } = await params
  const res = await client.changelog.entriesGet.$get({ slug, entrySlug })
  const data = await res.json()
  const entry = (data as any)?.entry

  if (!entry) {
    return createPageMetadata({
      title: "Entry Not Found",
      description: "This changelog entry could not be found",
      path: `/workspaces/${slug}/changelog/${entrySlug}`,
      indexable: false,
    })
  }

  return createPageMetadata({
    title: entry.title,
    description: entry.summary || `Changelog update: ${entry.title}`,
    path: `/workspaces/${slug}/changelog/${entrySlug}`,
    image: entry.coverImage || undefined,
  })
}

export default async function ChangelogEntryPage({ params }: Props) {
  await params
  return null
}

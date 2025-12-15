import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { client } from "@oreilla/api/client"
import { ChangelogRenderer } from "@oreilla/editor"
import { notFound } from "next/navigation"
import Link from "next/link"
import type { JSONContent } from "@tiptap/react"

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
  const { slug, entrySlug } = await params
  const res = await client.changelog.entriesGet.$get({ slug, entrySlug })
  const data = await res.json()
  const entry = (data as any)?.entry

  if (!entry) {
    notFound()
  }

  const publishedDate = entry.publishedAt
    ? new Date(entry.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <article className="max-w-3xl mx-auto py-8">
      {/* Back link */}
      <Link
        href={`/workspaces/${slug}/changelog`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Changelog
      </Link>

      {/* Cover image */}
      {entry.coverImage && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src={entry.coverImage}
            alt={entry.title}
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {entry.tags.map((tag: any) => (
              <span
                key={tag.id}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : undefined}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {entry.title}
        </h1>

        {publishedDate && (
          <time
            dateTime={entry.publishedAt}
            className="text-sm text-muted-foreground"
          >
            {publishedDate}
          </time>
        )}

        {entry.summary && (
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {entry.summary}
          </p>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ChangelogRenderer content={entry.content as JSONContent} />
      </div>
    </article>
  )
}


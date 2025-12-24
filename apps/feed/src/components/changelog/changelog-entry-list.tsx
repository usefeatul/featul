"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChangelogRenderer } from "@oreilla/editor"
import { client } from "@oreilla/api/client"
import { Button } from "@oreilla/ui/components/button"
import { Badge } from "@oreilla/ui/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@oreilla/ui/components/tabs"
import type { JSONContent } from "@tiptap/react"

interface ChangelogTag {
  id: string
  name: string
  slug: string
  color?: string | null
}

interface ChangelogEntryData {
  id: string
  title: string
  slug: string
  summary?: string | null
  coverImage?: string | null
  content: Record<string, unknown>
  status: "draft" | "published" | "archived"
  tags: ChangelogTag[]
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

interface ChangelogEntryListProps {
  slug: string
  initialEntries: ChangelogEntryData[]
  initialTotal: number
}

function EntryCard({
  entry,
  slug,
  isAdmin,
}: {
  entry: ChangelogEntryData
  slug: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const publishedDate = entry.publishedAt
    ? new Date(entry.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  const updatedDate = new Date(entry.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  // Truncate content for preview - show first 2 blocks
  const previewContent: JSONContent = {
    type: "doc",
    content: (entry.content as JSONContent).content?.slice(0, 2) || [],
  }

  return (
    <article className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
      {/* Admin badge */}
      {isAdmin && entry.status !== "published" && (
        <Badge
          variant="outline"
          className={
            entry.status === "draft"
              ? "absolute top-4 right-4 border-amber-500/50 text-amber-500"
              : "absolute top-4 right-4 border-muted-foreground/50 text-muted-foreground"
          }
        >
          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
        </Badge>
      )}

      {/* Cover image */}
      {entry.coverImage && (
        <div className="mb-4 -mx-6 -mt-6 rounded-t-xl overflow-hidden">
          <div className="relative w-full h-48">
            <Image
              src={entry.coverImage}
              alt={entry.title}
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
              loader={({ src }) => src}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {entry.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
              style={
                tag.color
                  ? { backgroundColor: `${tag.color}15`, color: tag.color }
                  : undefined
              }
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <Link
        href={
          entry.status === "published"
            ? `/workspaces/${slug}/changelog/${entry.slug}`
            : `/workspaces/${slug}/changelog/${entry.slug}/edit?id=${entry.id}`
        }
        className="block"
      >
        <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {entry.title}
        </h2>
      </Link>

      {/* Date */}
      <div className="mt-2 text-sm text-muted-foreground">
        {publishedDate ? (
          <time dateTime={entry.publishedAt!}>{publishedDate}</time>
        ) : (
          <span>Last updated: {updatedDate}</span>
        )}
      </div>

      {/* Summary or content preview */}
      {entry.summary ? (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {entry.summary}
        </p>
      ) : (
        <div className="mt-3 text-sm text-muted-foreground line-clamp-3 [&_*]:!my-0 [&_*]:!text-sm">
          <ChangelogRenderer content={previewContent} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <Link
          href={
            entry.status === "published"
              ? `/workspaces/${slug}/changelog/${entry.slug}`
              : `/workspaces/${slug}/changelog/${entry.slug}/edit?id=${entry.id}`
          }
          className="text-sm font-medium text-primary hover:underline"
        >
          {entry.status === "published" ? "Read more →" : "Continue editing →"}
        </Link>

        {isAdmin && entry.status === "published" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              router.push(
                `/workspaces/${slug}/changelog/${entry.slug}/edit?id=${entry.id}`
              )
            }}
          >
            Edit
          </Button>
        )}
      </div>
    </article>
  )
}

function EmptyState({ isAdmin, slug }: { isAdmin: boolean; slug: string }) {
  const router = useRouter()

  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold">No changelog entries yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
        {isAdmin
          ? "Create your first changelog entry to share updates with your users."
          : "Check back soon for product updates and announcements."}
      </p>
      {isAdmin && (
        <Button
          className="mt-4"
          onClick={() => router.push(`/workspaces/${slug}/changelog/new`)}
        >
          Create Entry
        </Button>
      )}
    </div>
  )
}

export function ChangelogEntryList({
  slug,
  initialEntries,
  initialTotal,
}: ChangelogEntryListProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<"published" | "all">("published")
  const [entries, setEntries] = useState<ChangelogEntryData[]>(initialEntries)
  const [allEntries, setAllEntries] = useState<ChangelogEntryData[]>([])
  const [loading, setLoading] = useState(false)

  // Check if user is admin by trying to fetch all entries
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await client.changelog.entriesListAll.$get({ slug, limit: 20 })
        const data = await res.json()
        if ((data as any)?.entries) {
          setIsAdmin(true)
          setAllEntries((data as any).entries)
        }
      } catch {
        // Not admin, that's fine
      }
    }
    checkAdmin()
  }, [slug])

  const displayEntries = activeTab === "all" ? allEntries : entries
  const showTabs = isAdmin && allEntries.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Product updates and announcements
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => router.push(`/workspaces/${slug}/changelog/new`)}>
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
              className="mr-2"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New Entry
          </Button>
        )}
      </div>

      {/* Tabs for admin */}
      {showTabs ? (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "published" | "all")}
        >
          <TabsList>
            <TabsTrigger value="published">
              Published ({entries.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({allEntries.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="published" className="mt-6">
            {entries.length === 0 ? (
              <EmptyState isAdmin={isAdmin} slug={slug} />
            ) : (
              <div className="grid gap-6">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    slug={slug}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {allEntries.length === 0 ? (
              <EmptyState isAdmin={isAdmin} slug={slug} />
            ) : (
              <div className="grid gap-6">
                {allEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    slug={slug}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        // Non-admin view
        <>
          {displayEntries.length === 0 ? (
            <EmptyState isAdmin={isAdmin} slug={slug} />
          ) : (
            <div className="grid gap-6">
              {displayEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  slug={slug}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

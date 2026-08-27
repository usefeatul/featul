import { and, desc, eq } from "drizzle-orm"
import { board, changelogEntry, db, workspace } from "@featul/db"

/** Escapes text for RSS XML. */
export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/** Public origin: custom domain wins over the featul subdomain. */
export function publicChangelogBaseUrl(opts: {
  slug: string
  customDomain?: string | null
}) {
  const host = opts.customDomain?.trim()
  if (host) return `https://${host}`
  return `https://${opts.slug}.featul.com`
}

export type ChangelogRssEntry = {
  title: string
  slug: string
  summary: string | null
  publishedAt: Date | null
  updatedAt: Date
}

/** Published changelog items; empty when the board is hidden or private. */
export async function getPublishedChangelogEntriesForRss(
  slug: string,
  limit = 50,
): Promise<{
  workspaceName: string
  workspaceSlug: string
  customDomain: string | null
  entries: ChangelogRssEntry[]
} | null> {
  const [ws] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      customDomain: workspace.customDomain,
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) return null

  const [changelogBoard] = await db
    .select({
      id: board.id,
      isVisible: board.isVisible,
      isPublic: board.isPublic,
    })
    .from(board)
    .where(
      and(eq(board.workspaceId, ws.id), eq(board.systemType, "changelog")),
    )
    .limit(1)

  if (!changelogBoard || !changelogBoard.isVisible || !changelogBoard.isPublic) {
    return {
      workspaceName: ws.name || ws.slug,
      workspaceSlug: ws.slug,
      customDomain: ws.customDomain ?? null,
      entries: [],
    }
  }

  const entries = await db
    .select({
      title: changelogEntry.title,
      slug: changelogEntry.slug,
      summary: changelogEntry.summary,
      publishedAt: changelogEntry.publishedAt,
      updatedAt: changelogEntry.updatedAt,
    })
    .from(changelogEntry)
    .where(
      and(
        eq(changelogEntry.boardId, changelogBoard.id),
        eq(changelogEntry.status, "published"),
      ),
    )
    .orderBy(desc(changelogEntry.publishedAt), desc(changelogEntry.updatedAt))
    .limit(Math.min(Math.max(limit, 1), 100))

  return {
    workspaceName: ws.name || ws.slug,
    workspaceSlug: ws.slug,
    customDomain: ws.customDomain ?? null,
    entries,
  }
}

/** Builds an RSS 2.0 feed string for published changelog entries. */
export function buildChangelogRssXml(opts: {
  workspaceName: string
  channelLink: string
  feedLink: string
  entries: ChangelogRssEntry[]
}) {
  const items = opts.entries
    .map((entry) => {
      const link = `${opts.channelLink}/changelog/p/${entry.slug}`
      const pubDate = entry.publishedAt
        ? `<pubDate>${new Date(entry.publishedAt).toUTCString()}</pubDate>`
        : `<pubDate>${new Date(entry.updatedAt).toUTCString()}</pubDate>`
      const description = entry.summary
        ? `<description>${escapeXml(entry.summary)}</description>`
        : ""

      return `<item>
  <title>${escapeXml(entry.title)}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  ${pubDate}
  ${description}
</item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${opts.workspaceName} Changelog`)}</title>
    <link>${opts.channelLink}/changelog</link>
    <description>${escapeXml(`Product updates from ${opts.workspaceName}`)}</description>
    <language>en-us</language>
    <atom:link href="${opts.feedLink}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`
}

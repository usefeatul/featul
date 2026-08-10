import {
  buildChangelogRssXml,
  getPublishedChangelogEntriesForRss,
  publicChangelogBaseUrl,
} from "@/lib/changelog/rss"

export const revalidate = 3600

type RouteContext = {
  params: Promise<{ subdomain: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { subdomain } = await context.params
  const slug = (subdomain || "").trim().toLowerCase()
  if (!slug) {
    return new Response("Not found", { status: 404 })
  }

  const data = await getPublishedChangelogEntriesForRss(slug, 50)
  if (!data) {
    return new Response("Not found", { status: 404 })
  }

  const baseUrl = publicChangelogBaseUrl({
    slug: data.workspaceSlug,
    customDomain: data.customDomain,
  })
  const feedLink = `${baseUrl}/changelog/feed.xml`
  const xml = buildChangelogRssXml({
    workspaceName: data.workspaceName,
    channelLink: baseUrl,
    feedLink,
    entries: data.entries,
  })

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}

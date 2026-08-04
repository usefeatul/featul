import { getPosts } from "@/lib/query"
import { absoluteUrl } from "@/config/seo"

export const revalidate = 3600

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET() {
  const data = await getPosts()
  const posts = data?.posts ?? []

  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/blog/${post.slug}`)
      const pubDate = post.publishedAt
        ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`
        : ""
      const description = post.excerpt
        ? `<description>${escapeXml(post.excerpt)}</description>`
        : ""

      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${link}</link>
  <guid isPermaLink="true">${link}</guid>
  ${pubDate}
  ${description}
</item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Featul Blog</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>Product feedback, roadmaps, and SaaS growth insights from Featul.</description>
    <language>en-us</language>
    <atom:link href="${absoluteUrl("/blog/feed.xml")}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  })
}

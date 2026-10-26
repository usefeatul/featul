import { getPosts, getSinglePost } from "@/lib/query"
import type { MarblePost, MarblePostListResponse, MarblePostResponse } from "@/types/marble"
import { blocks, isoDate, linkList } from "../format"
import type { MarkdownRegistry } from "../types"
import { htmlToMarkdown } from "./html-to-markdown"

const BLOG_TITLE = "Blog"
const BLOG_SUMMARY =
  "Thoughts, product notes, and quiet updates on building clearer customer feedback software."

async function listPosts(): Promise<MarblePost[]> {
  const res = (await getPosts()) as MarblePostListResponse | undefined
  return Array.isArray(res?.posts) ? res.posts : []
}

export const blogRoutes = {
  "/blog": {
    section: "blog",
    entries: () => [{ path: "/blog", title: BLOG_TITLE, description: BLOG_SUMMARY }],
    render: async () => {
      const posts = await listPosts()
      return {
        title: BLOG_TITLE,
        summary: BLOG_SUMMARY,
        path: "/blog",
        updated: isoDate(posts.map((post) => post.publishedAt).filter(Boolean).sort().at(-1)),
        body: posts.length
          ? linkList(
              posts.map((post) => ({
                label: post.title,
                href: `/blog/${post.slug}`,
                description: [isoDate(post.publishedAt), post.category?.name, post.excerpt].filter(Boolean).join(" · "),
              })),
            )
          : "No posts published yet.",
      }
    },
  },
  "/blog/[slug]": {
    section: "blog",
    llmsLimit: 50,
    fullLimit: 20,
    entries: async () =>
      (await listPosts()).map((post) => ({
        path: `/blog/${post.slug}`,
        title: post.title,
        description: post.excerpt || post.title,
      })),
    render: async ({ slug }) => {
      if (!slug) return null
      const res = (await getSinglePost(slug)) as MarblePostResponse | undefined
      const post = res?.post
      if (!post?.title) return null
      const author = post.author ?? (post.authors && post.authors.length > 0 ? post.authors[0] : null)
      const published = isoDate(post.publishedAt)
      const byline = [published && `Posted on ${published}`, author?.name && `by ${author.name}`]
        .filter(Boolean)
        .join(" ")
      return {
        title: post.title,
        summary: post.excerpt || post.title,
        path: `/blog/${post.slug || slug}`,
        updated: published,
        body: blocks(byline, htmlToMarkdown(post.content)),
        related: [{ label: "All blog posts", href: "/blog" }],
      }
    },
  },
} satisfies Pick<MarkdownRegistry, "/blog" | "/blog/[slug]">

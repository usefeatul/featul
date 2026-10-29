import { flattenDocsNav, getDocsNeighbors } from "@/config/docsNav"
import { absoluteUrl } from "@/config/seo"
import { readDocsMarkdown, type DocsPageId } from "@/lib/docs"
import type { MarkdownLink, MarkdownRegistry } from "../types"

function findDoc(href: string) {
  return flattenDocsNav().find((item) => item.href === href) ?? null
}

/** Drop the leading `# Title` — `renderDoc` adds its own H1. */
function stripTitle(content: string) {
  return content.replace(/^\s*#\s+.+\r?\n+/, "").trim()
}

/** Docs markdown uses site-relative links; make them absolute. */
function absolutizeLinks(content: string) {
  return content.replace(/\]\((\/[^)\s]*)\)/g, (_, path: string) => `](${absoluteUrl(path)})`)
}

export const docsRoutes = {
  "/docs/[...slug]": {
    section: "docs",
    static: true,
    entries: async () =>
      Promise.all(
        flattenDocsNav().map(async (item) => {
          const { frontmatter } = await readDocsMarkdown(item.id as DocsPageId)
          return {
            path: item.href,
            title: frontmatter.title || item.label,
            description: frontmatter.description ?? `${item.sectionLabel}: ${item.label}`,
          }
        }),
      ),
    render: async ({ slug }) => {
      const href = `/docs/${slug}`
      const item = findDoc(href)
      if (!item) return null
      const { frontmatter, content } = await readDocsMarkdown(item.id as DocsPageId)
      const { prev, next } = getDocsNeighbors(href)
      const related: MarkdownLink[] = [prev, next]
        .filter((neighbor): neighbor is NonNullable<typeof neighbor> => Boolean(neighbor))
        .map((neighbor) => ({ label: neighbor.label, href: neighbor.href }))
      return {
        title: frontmatter.title || item.label,
        summary: frontmatter.description ?? `${item.sectionLabel}: ${item.label}`,
        path: href,
        body: absolutizeLinks(stripTitle(content)),
        related,
      }
    },
  },
} satisfies Pick<MarkdownRegistry, "/docs/[...slug]">

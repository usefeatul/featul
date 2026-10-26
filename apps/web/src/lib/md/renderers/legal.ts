import { readLegalMarkdown } from "@/lib/markdown"
import type { LegalSlug } from "@/types/legal"
import { isoDate } from "../format"
import type { MarkdownRegistry, MarkdownRoute } from "../types"

function stripLegalHeader(markdown: string) {
  // Same intro removal as components/legal/page.tsx: title and last-updated move to the doc header.
  return markdown
    .replace(/^\s*#\s+.+\r?\n+/, "")
    .replace(/^\s*\*\*Last updated:\*\*[^\n]*\r?\n+/i, "")
    .replace(/^\s*Last updated:\s*[^\n]*\r?\n+/i, "")
    .trim()
}

function legalRoute(slug: LegalSlug): MarkdownRoute {
  return {
    section: "legal",
    static: true,
    entries: async () => {
      const { frontmatter } = await readLegalMarkdown(slug)
      return [{ path: `/${slug}`, title: frontmatter.title, description: frontmatter.description ?? frontmatter.title }]
    },
    render: async () => {
      const { frontmatter, content } = await readLegalMarkdown(slug)
      return {
        title: frontmatter.title,
        summary: frontmatter.description ?? frontmatter.title,
        path: `/${slug}`,
        updated: isoDate(frontmatter.lastUpdated),
        body: stripLegalHeader(content),
      }
    },
  }
}

export const legalRoutes = {
  "/terms": legalRoute("terms"),
  "/privacy": legalRoute("privacy"),
  "/gdpr": legalRoute("gdpr"),
} satisfies Pick<MarkdownRegistry, "/terms" | "/privacy" | "/gdpr">

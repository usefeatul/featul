import { renderDoc } from "./format"
import { matchMarkdownPattern, MARKDOWN_PATTERNS, type MarkdownPattern } from "./patterns"
import type { MarkdownDoc, MarkdownEntry, MarkdownRegistry, MarkdownRoute, MarkdownSection } from "./types"
import { alternativesRoutes } from "./renderers/alternatives"
import { blogRoutes } from "./renderers/blog"
import { coreRoutes } from "./renderers/core"
import { definitionsRoutes } from "./renderers/definitions"
import { docsRoutes } from "./renderers/docs"
import { integrationsRoutes } from "./renderers/integrations"
import { legalRoutes } from "./renderers/legal"
import { toolsRoutes } from "./renderers/tools"
import { useCasesRoutes } from "./renderers/use-cases"

/** Pattern → renderer. Every entry in `MARKDOWN_PATTERNS` must have one. */
export const MARKDOWN_REGISTRY: MarkdownRegistry = {
  ...coreRoutes,
  ...docsRoutes,
  ...alternativesRoutes,
  ...integrationsRoutes,
  ...useCasesRoutes,
  ...definitionsRoutes,
  ...toolsRoutes,
  ...blogRoutes,
  ...legalRoutes,
}

export const SECTION_ORDER: MarkdownSection[] = ["core", "docs", "compare", "learn", "tools", "blog", "legal"]

export type ResolvedMarkdown = {
  pattern: MarkdownPattern
  route: MarkdownRoute
  doc: MarkdownDoc
  markdown: string
}

export async function resolveMarkdown(path: string): Promise<ResolvedMarkdown | null> {
  const match = matchMarkdownPattern(path)
  if (!match) return null
  const route = MARKDOWN_REGISTRY[match.pattern]
  const doc = await route.render(match.params)
  if (!doc) return null
  return { pattern: match.pattern, route, doc, markdown: renderDoc(doc) }
}

export type CatalogEntry = MarkdownEntry & { pattern: MarkdownPattern; section: MarkdownSection }

/** Every addressable Markdown route, in llms.txt section order. */
export async function listMarkdownRoutes(): Promise<CatalogEntry[]> {
  const groups = await Promise.all(
    MARKDOWN_PATTERNS.map(async (pattern) => {
      const route = MARKDOWN_REGISTRY[pattern]
      const entries = await route.entries()
      return entries.map((entry) => ({ ...entry, pattern, section: route.section }))
    }),
  )
  return groups
    .flat()
    .sort((a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section))
}

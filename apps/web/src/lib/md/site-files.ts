import { CONTACT_EMAIL, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/config/seo"
import { summarizePricingPlans } from "@/types/plan"
import { isoDate } from "./format"
import { htmlPathToMarkdownPath } from "./patterns"
import { listMarkdownRoutes, MARKDOWN_REGISTRY, resolveMarkdown, SECTION_ORDER, type CatalogEntry } from "./registry"
import type { MarkdownSection } from "./types"

// Keep in sync with: src/app/robots.txt/route.ts and the [scope] section of ai.txt below.
export const AI_DISALLOWED_PATHS = ["/api/", "/search"]

const LLMS_FULL_WARN_CHARS = 500_000

const SECTION_TITLES: Record<MarkdownSection, string> = {
  core: "Core pages",
  docs: "Docs",
  compare: "Compare",
  learn: "Learn",
  tools: "Free tools",
  blog: "Blog",
  legal: "Optional",
}

/** Plain, factual summary shared by llms.txt, llms-full.txt and ai.txt. */
export const SITE_SUMMARY = `${SITE_NAME} is customer feedback boards, public or private roadmaps, and changelogs in one EU-hosted workspace for SaaS and product teams. It is open source (MIT) and priced per workspace, not per seat.`

function siteFacts() {
  return `Plans: ${summarizePricingPlans()} (GBP, flat per workspace). Hosting: EU. Audience: SaaS and product teams replacing tools like Canny, Featurebase, or UserJot. Source code: open source on GitHub. Contact: ${CONTACT_EMAIL}.`
}

function mdUrl(path: string) {
  return absoluteUrl(htmlPathToMarkdownPath(path) ?? path)
}

function groupBySection(entries: CatalogEntry[]) {
  const groups = new Map<MarkdownSection, CatalogEntry[]>()
  for (const entry of entries) {
    const list = groups.get(entry.section) ?? []
    list.push(entry)
    groups.set(entry.section, list)
  }
  return groups
}

/** Applies each pattern's `llmsLimit` (default 50). */
function capPerPattern(entries: CatalogEntry[], limitFor: (entry: CatalogEntry) => number | undefined) {
  const counts = new Map<string, number>()
  return entries.filter((entry) => {
    const limit = limitFor(entry)
    const count = counts.get(entry.pattern) ?? 0
    counts.set(entry.pattern, count + 1)
    return limit === undefined || count < limit
  })
}

export async function renderLlmsTxt() {
  const all = await listMarkdownRoutes()
  const listed = capPerPattern(all, (entry) => MARKDOWN_REGISTRY[entry.pattern].llmsLimit ?? 50)
  const groups = groupBySection(listed)

  const sections = SECTION_ORDER.filter((section) => groups.has(section)).map((section) => {
    const lines = groups
      .get(section)!
      .map((entry) => `- [${entry.title}](${mdUrl(entry.path)}): ${entry.description.replace(/\s+/g, " ").trim()}`)
    return `## ${SECTION_TITLES[section]}\n${lines.join("\n")}`
  })

  // Keep in sync with: /robots.txt and /ai.txt.
  return `# ${SITE_NAME}

> ${SITE_SUMMARY}

${siteFacts()} Every page below is a Markdown twin of the HTML page; append \`.md\` to any listed URL or send \`Accept: text/markdown\`.

${sections.join("\n\n")}

## Machine-readable
- [Full content](${absoluteUrl("/llms-full.txt")}): Every page above rendered into one file
- [Docs index](${absoluteUrl("/docs/llms.txt")}): Documentation pages only
- [Markdown catalog](${absoluteUrl("/api/md/_catalog")}): JSON list of every Markdown route
- [Sitemap](${absoluteUrl("/sitemap.xml")}): HTML pages for search engines
- [AI usage policy](${absoluteUrl("/ai.txt")}): Permissions, restrictions, and attribution
- [Blog RSS](${absoluteUrl("/blog/feed.xml")}): Latest posts
`
}

export async function renderDocsLlmsTxt() {
  const docs = (await listMarkdownRoutes()).filter((entry) => entry.section === "docs")
  return `# ${SITE_NAME} Docs

> Documentation for ${SITE_NAME}: feedback boards, roadmaps, changelogs, branding, custom domains, the embed widget, and the API.

Use these Markdown pages instead of the HTML docs UI. Start with the overview to decide whether ${SITE_NAME} fits a customer-feedback project. Full site index: ${absoluteUrl("/llms.txt")}

${docs.map((entry) => `- [${entry.title}](${mdUrl(entry.path)}): ${entry.description}`).join("\n")}
`
}

export async function renderLlmsFullTxt() {
  const all = await listMarkdownRoutes()
  const omitted: string[] = []
  const included = capPerPattern(all, (entry) => {
    const limit = MARKDOWN_REGISTRY[entry.pattern].fullLimit
    return limit
  })
  for (const pattern of new Set(all.map((entry) => entry.pattern))) {
    const total = all.filter((entry) => entry.pattern === pattern).length
    const kept = included.filter((entry) => entry.pattern === pattern).length
    if (kept < total) omitted.push(`- ${pattern}: ${kept} of ${total} pages included; the rest are listed in ${absoluteUrl("/llms.txt")} and ${absoluteUrl("/api/md/_catalog")}`)
  }

  const pages = await Promise.all(
    included.map(async (entry) => {
      const resolved = await resolveMarkdown(entry.path)
      return resolved ? `---\n<!-- source: ${absoluteUrl(entry.path)} -->\n\n${resolved.markdown.trim()}` : null
    }),
  )

  const body = `# ${SITE_NAME} - full content

> ${SITE_SUMMARY}

Generated: ${isoDate(new Date())}
${omitted.length ? `\nLimits:\n${omitted.join("\n")}\n` : ""}
${pages.filter(Boolean).join("\n\n")}
`
  if (body.length > LLMS_FULL_WARN_CHARS) {
    console.warn(`[llms-full.txt] ${body.length} chars exceeds ${LLMS_FULL_WARN_CHARS}; lower fullLimit on large routes.`)
  }
  return body
}

/** ai.txt, following the ai-visibility.org.uk ai-txt spec v1.1.1. */
export function renderAiTxt() {
  return `# ai.txt for ${SITE_NAME}
# Spec: ai-txt v1.1.1 (https://ai-visibility.org.uk)
# Keep in sync with: ${absoluteUrl("/robots.txt")} and ${absoluteUrl("/llms.txt")}

[identity]
name: ${SITE_NAME}
url: ${SITE_URL}/
description: ${DEFAULT_DESCRIPTION}
summary: ${SITE_SUMMARY}
contact: ${CONTACT_EMAIL}

[permissions]
summarise: allowed
quote: allowed-with-attribution
cite: allowed
index-for-search: allowed
index-for-answers: allowed
training: allowed-public-content-only

[restrictions]
- Do not fabricate quotes, statements, prices, or features attributed to ${SITE_NAME}.
- Do not generate fake reviews, ratings, or testimonials about ${SITE_NAME}.
- Do not present ${SITE_NAME} content as your own; attribute it.
- Do not train on, or retain, customer workspace data (feedback posts, comments, votes, member details) hosted on ${SITE_NAME} workspaces.
- Pricing and plan limits change; cite ${absoluteUrl("/pricing")} and the date you fetched it.

[attribution]
format: "${SITE_NAME} - <page title>" with a link to the canonical HTML URL
canonical: Use the HTML URL (the Content-Location header on Markdown responses), not the .md URL.

[scope]
include: /
${AI_DISALLOWED_PATHS.map((path) => `exclude: ${path}`).join("\n")}
exclude: https://app.featul.com/ (signed-in product)
exclude: https://<workspace>.featul.com/ and customer custom domains (customer workspaces)

[resources]
llms: ${absoluteUrl("/llms.txt")}
llms-full: ${absoluteUrl("/llms-full.txt")}
catalog: ${absoluteUrl("/api/md/_catalog")}
sitemap: ${absoluteUrl("/sitemap.xml")}

[contact]
email: ${CONTACT_EMAIL}

Last updated: 2026-10-26
`
}

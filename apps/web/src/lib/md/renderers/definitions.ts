import {
  DEFINITIONS,
  getDefinitionBySlug,
  getDefinitionContent,
  getDefinitionLastModified,
  getPrimarySlug,
} from "@/content/definitions"
import { findToolForDefinition } from "@/types/tools"
import { blocks, faq, heading, isoDate, link, linkList, list } from "../format"
import type { MarkdownRegistry } from "../types"

const INDEX_TITLE = "SaaS Metrics Encyclopedia"
const INDEX_SUMMARY =
  "Short, practical definitions with formulas and examples. Each term links to tools and related concepts."

function sortedDefinitions() {
  return [...DEFINITIONS].sort((a, b) => a.name.localeCompare(b.name))
}

function section(title: string, ...parts: (string | false | null | undefined)[]) {
  const body = blocks(...parts)
  return body ? `${heading(2, title)}\n\n${body}` : null
}

export const definitionsRoutes = {
  "/definitions": {
    section: "learn",
    static: true,
    entries: () => [{ path: "/definitions", title: INDEX_TITLE, description: INDEX_SUMMARY }],
    render: () => {
      const items = sortedDefinitions()
      return {
        title: INDEX_TITLE,
        summary: INDEX_SUMMARY,
        path: "/definitions",
        body: blocks(
          `Glossary • ${items.length} terms`,
          linkList(items.map((d) => ({ label: d.name, href: `/definitions/${d.slug}`, description: d.short }))),
        ),
      }
    },
  },
  "/definitions/[term]": {
    section: "learn",
    static: true,
    entries: () =>
      DEFINITIONS.map((d) => ({ path: `/definitions/${d.slug}`, title: d.name, description: d.short })),
    render: ({ term }) => {
      const primary = term ? getPrimarySlug(term) : undefined
      const def = primary ? getDefinitionBySlug(primary) : undefined
      if (!def) return null

      const overview = def.overview ?? `${def.practical} ${def.expert}`
      const relatedTool = findToolForDefinition(def.slug)
      const relatedToolHref = relatedTool
        ? `/tools/categories/${relatedTool.categorySlug}/${relatedTool.tool.slug}`
        : null
      const relatedTerms = (def.related ?? []).map((slug) => {
        const related = getDefinitionBySlug(slug)
        return { label: related?.name ?? slug, href: `/definitions/${slug}`, description: related?.short }
      })

      const body = blocks(
        `By ${def.author ?? "Jean Daly"}${def.publishedAt ? ` · Published ${def.publishedAt}` : ""}`,
        section("Overview", def.essay?.intro, overview),
        section("Definition", def.essay?.analysis, getDefinitionContent(def)),
        def.formula &&
          section(
            def.formula.title,
            def.formula.body,
            def.essay?.formulaContext,
            def.formula.code && `\`\`\`\n${def.formula.code}\n\`\`\``,
            relatedToolHref &&
              `Use the ${link(relatedTool!.tool.name, relatedToolHref)} to run this formula with your own numbers.`,
          ),
        def.example && section(def.example.title, def.example.body, def.essay?.exampleContext),
        def.pitfalls?.length && section("Common pitfalls", def.essay?.pitfallsContext, list(def.pitfalls)),
        def.benchmarks && section("Benchmarks", def.benchmarks, def.essay?.benchmarksContext),
        def.notes?.length && section("Notes", def.essay?.notesContext, list(def.notes)),
        def.useCases?.length &&
          section("Use cases", def.useCases.map((item) => `${heading(3, item.title)}\n\n${item.body}`).join("\n\n")),
        ...(def.sections ?? []).map((item) => section(item.title, item.body)),
        relatedTerms.length && section("Related terms", def.essay?.relatedContext, linkList(relatedTerms)),
        def.faqs?.length &&
          section(
            "Questions & Answers",
            def.essay?.faqsContext,
            faq(def.faqs.map((item) => ({ question: item.q, answer: item.a }))),
          ),
      )

      return {
        title: def.name,
        summary: def.short,
        path: `/definitions/${def.slug}`,
        updated: isoDate(getDefinitionLastModified(def.slug)),
        body,
        related: [{ label: "All definitions", href: "/definitions" }],
      }
    },
  },
} satisfies Pick<MarkdownRegistry, "/definitions" | "/definitions/[term]">

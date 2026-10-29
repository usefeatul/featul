import { USE_CASE_ARTICLES } from "@/content/use-cases"
import { generateUseCasePage } from "@/lib/data/programmatic/generators"
import { getAllUseCaseSlugs as getProgrammaticSlugs } from "@/lib/data/programmatic/matrix"
import { getRelatedPages } from "@/lib/seo/interlink"
import { getAllUseCasesForIndex, getAllUseCaseSlugs as getOriginalSlugs, getUseCaseBySlug } from "@/types/scenarios"
import { blocks, faq, heading, linkList, list } from "../format"
import type { MarkdownDoc, MarkdownRegistry } from "../types"

const INDEX_DESCRIPTION =
  "Explore practical Featul use cases: centralize product feedback, run transparent roadmaps, and keep customers in the loop with changelogs."

/** Same merged, deduped set as `generateStaticParams` and the sitemap. */
function allUseCaseSlugs() {
  return [...new Set([...getOriginalSlugs(), ...getProgrammaticSlugs()])]
}

function renderArticle(slug: string): MarkdownDoc | null {
  const article = USE_CASE_ARTICLES[slug]
  const meta = getUseCaseBySlug(slug)
  if (!article || !meta) return null

  return {
    title: article.title,
    summary: meta.description,
    path: `/use-cases/${slug}`,
    body: blocks(
      `${article.badge}. ${article.description}`,
      ...article.sections.map((section) =>
        blocks(heading(2, section.title), ...section.paragraphs, section.list ? list(section.list) : null),
      ),
    ),
    // Inline links at the end of the article; /contact has no page, so it is dropped.
    related: article.sections
      .flatMap((section) => section.links ?? [])
      .filter((item) => item.href !== "/contact")
      .map((item) => ({ label: item.label, href: item.href })),
  }
}

function renderProgrammatic(slug: string): MarkdownDoc | null {
  const page = generateUseCasePage(slug)
  if (!page) return null
  const { meta, useCase, sections, faqs } = page
  const badge = useCase.industry ?? useCase.persona ?? "Use case"

  return {
    title: meta.h1,
    summary: meta.description,
    path: meta.canonical,
    body: blocks(
      `${badge}. ${sections.intro}`,
      heading(2, "The challenge"),
      "Common friction points this use case is built to solve.",
      ...sections.painPoints.map((item) => `${heading(3, item.problem)}\n\n${item.impact}`),
      heading(2, "How Featul helps"),
      "A clearer workflow from feedback intake to shipped updates.",
      ...sections.solutions.map((item) => `${heading(3, item.solution)}\n\n${item.benefit}`),
      heading(2, "Frequently asked questions"),
      faq(faqs),
    ),
    related: [
      ...getRelatedPages({ currentSlug: slug, currentType: "use-case" }).map((item) => ({
        label: item.label,
        href: item.href,
      })),
      { label: "View all use cases", href: "/use-cases" },
    ],
  }
}

export const useCasesRoutes = {
  "/use-cases": {
    section: "learn",
    static: true,
    entries: () => [{ path: "/use-cases", title: "Use cases", description: INDEX_DESCRIPTION }],
    render: () => {
      const items = getAllUseCasesForIndex()
      return {
        title: "See how teams actually use Featul",
        summary: INDEX_DESCRIPTION,
        path: "/use-cases",
        body: blocks(
          "Practical guides for centralizing feedback, aligning roadmaps, and closing the loop with customers.",
          heading(2, "Guides for real product teams"),
          `${items.length} guide${items.length === 1 ? "" : "s"}. Scenario-based walkthroughs for feedback, roadmaps, growth, and customer success.`,
          linkList(
            items.map((item) => ({
              label: item.cardTitle ?? item.name,
              href: `/use-cases/${item.slug}`,
              description: `${item.badge}: ${item.cardDescription ?? item.description}`,
            })),
          ),
        ),
      }
    },
  },
  "/use-cases/[slug]": {
    section: "learn",
    static: true,
    entries: () =>
      allUseCaseSlugs().flatMap((slug) => {
        const original = getUseCaseBySlug(slug)
        if (original) return [{ path: `/use-cases/${slug}`, title: original.name, description: original.description }]
        const page = generateUseCasePage(slug)
        return page ? [{ path: page.meta.canonical, title: page.meta.title, description: page.meta.description }] : []
      }),
    render: ({ slug = "" }) => renderArticle(slug) ?? renderProgrammatic(slug),
  },
} satisfies Pick<MarkdownRegistry, "/use-cases" | "/use-cases/[slug]">

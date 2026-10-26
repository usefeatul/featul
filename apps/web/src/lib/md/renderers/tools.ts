import { getRelatedPages } from "@/lib/seo/interlink"
import { getCategoryBySlug, getToolBySlugs, TOOL_CATEGORIES, type ToolCategory, type ToolItem } from "@/types/tools"
import { blocks, faq, heading, linkList, url } from "../format"
import type { MarkdownRegistry } from "../types"

const TOOLS_TITLE = "Free tools for feedback, roadmaps, and changelogs"
const TOOLS_SUMMARY =
  "Prioritize votes, plan a public roadmap, and write release notes. Also includes SaaS calculators for growth and finance."
const CATEGORIES_TITLE = "Categories"
const CATEGORIES_SUMMARY = "Find calculators and templates grouped by topic."

const categoryPath = (category: ToolCategory) => `/tools/categories/${category.slug}`
const toolPath = (categorySlug: string, tool: ToolItem) => `/tools/categories/${categorySlug}/${tool.slug}`

function categoryLinks() {
  return linkList(
    [...TOOL_CATEGORIES]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((category) => ({
        label: category.name,
        href: categoryPath(category),
        description: `${category.description} (${category.tools.length} tool${category.tools.length === 1 ? "" : "s"})`,
      })),
  )
}

function toolLinks(category: ToolCategory) {
  return linkList(
    [...category.tools]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((tool) => ({ label: tool.name, href: toolPath(category.slug, tool), description: tool.description })),
  )
}

/** Same questions and answers as the page's FAQPage JSON-LD (`buildToolFaqSchema`). */
function toolFaq(tool: ToolItem, categoryName: string) {
  const calcSection =
    tool.contentSections?.find((s) => /formula|calculate|calculation|basic/i.test(s.title)) || tool.contentSections?.[0]
  const calcText = calcSection
    ? calcSection.code
      ? `${calcSection.body ? `${calcSection.body} ` : ""}Formula: ${calcSection.code}`
      : calcSection.body || `Use the calculator inputs to compute ${tool.name.toLowerCase()}.`
    : `Use the calculator inputs to compute ${tool.name.toLowerCase()}.`
  return [
    { question: `What is ${tool.name}?`, answer: tool.description },
    { question: `How do I calculate ${tool.name}?`, answer: calcText },
    {
      question: `When is ${tool.name} useful?`,
      answer: `Use ${tool.name} to make ${categoryName.toLowerCase()} decisions more confidently by quantifying key metrics.`,
    },
  ]
}

export const toolsRoutes = {
  "/tools": {
    section: "tools",
    static: true,
    entries: () => [{ path: "/tools", title: TOOLS_TITLE, description: TOOLS_SUMMARY }],
    render: () => {
      const total = TOOL_CATEGORIES.reduce((sum, c) => sum + c.tools.length, 0)
      return {
        title: TOOLS_TITLE,
        summary: TOOLS_SUMMARY,
        path: "/tools",
        body: blocks(`Free tools • ${total} calculators`, heading(2, "Categories"), categoryLinks()),
      }
    },
  },
  "/tools/categories": {
    section: "tools",
    static: true,
    entries: () => [{ path: "/tools/categories", title: "Tool categories", description: CATEGORIES_SUMMARY }],
    render: () => ({
      title: CATEGORIES_TITLE,
      summary: CATEGORIES_SUMMARY,
      path: "/tools/categories",
      body: categoryLinks(),
      related: [{ label: "All tools", href: "/tools" }],
    }),
  },
  "/tools/categories/[category]": {
    section: "tools",
    static: true,
    entries: () =>
      TOOL_CATEGORIES.map((category) => ({
        path: categoryPath(category),
        title: `${category.name} tools`,
        description: category.description,
      })),
    render: ({ category: slug }) => {
      const category = slug ? getCategoryBySlug(slug) : undefined
      if (!category) return null
      return {
        title: category.name,
        summary: category.description,
        path: categoryPath(category),
        body: toolLinks(category),
        related: [
          { label: "Tools", href: "/tools" },
          { label: "Categories", href: "/tools/categories" },
        ],
      }
    },
  },
  "/tools/categories/[category]/[tool]": {
    section: "tools",
    static: true,
    // Listed in llms.txt; the calculators are interactive, so not concatenated into llms-full.txt.
    fullLimit: 0,
    entries: () =>
      TOOL_CATEGORIES.flatMap((category) =>
        category.tools.map((tool) => ({
          path: toolPath(category.slug, tool),
          title: tool.name,
          description: tool.description,
        })),
      ),
    render: ({ category: categorySlug, tool: toolSlug }) => {
      if (!categorySlug || !toolSlug) return null
      const tool = getToolBySlugs(categorySlug, toolSlug)
      if (!tool) return null
      const category = getCategoryBySlug(categorySlug)
      const path = toolPath(categorySlug, tool)
      const sections = (tool.contentSections ?? []).map((section) =>
        blocks(
          section.title && heading(2, section.title),
          section.body,
          section.code && `\`\`\`\n${section.code}\n\`\`\``,
        ),
      )
      return {
        title: tool.name,
        summary: tool.description,
        path,
        body: blocks(
          `This is an interactive calculator. Enter your own numbers at ${url(path)}.`,
          ...sections,
          heading(2, "FAQ"),
          faq(toolFaq(tool, category?.name || "Tools")),
        ),
        related: [
          ...(category ? [{ label: `${category.name} tools`, href: categoryPath(category) }] : []),
          ...getRelatedPages({ currentSlug: toolSlug, currentType: "tool" }).map((item) => ({
            label: item.label,
            href: item.href,
          })),
        ].filter((item, i, all) => all.findIndex((other) => other.href === item.href) === i),
      }
    },
  },
} satisfies Pick<
  MarkdownRegistry,
  "/tools" | "/tools/categories" | "/tools/categories/[category]" | "/tools/categories/[category]/[tool]"
>

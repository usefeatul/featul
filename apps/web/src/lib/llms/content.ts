import { docsSections } from "@/config/docsNav"
import { DEFAULT_DESCRIPTION, absoluteUrl } from "@/config/seo"
import { readDocsMarkdown, type DocsPageId } from "@/lib/docs"
import { htmlPathToMarkdownPath, normalizeMarkdownPathname } from "@/lib/llms/paths"
import {
  PRICING_PLAN_ORDER,
  PRICING_PLANS,
  formatPricingPrice,
} from "@/types/plan"

function mdUrl(htmlPath: string) {
  const twin = htmlPathToMarkdownPath(htmlPath) ?? htmlPath
  return absoluteUrl(twin)
}

function findDocsNav(pathname: string) {
  const normalized = normalizeMarkdownPathname(pathname)
  for (const section of docsSections) {
    for (const item of section.items) {
      if (item.href === normalized) {
        return { section, item }
      }
    }
  }
  return null
}

export function renderHomepageMarkdown() {
  const pricing = mdUrl("/pricing")
  const docs = mdUrl("/docs/getting-started/overview")
  const signup = PRICING_PLANS.free.href

  return `# Featul

${DEFAULT_DESCRIPTION}

Featul is a SaaS workspace for product teams that collect customer feedback, prioritize it on a public or private roadmap, and publish changelogs. Hosting is in the EU. Typical comparisons: Canny, Featurebase, and Productboard (feedback and roadmap slice).

## Who it is for

SaaS and product teams that want one place for feedback boards, voting, roadmaps, and release notes, with branding and custom domains.

## Product

- **Feedback boards** — Feature requests, bug reports, and suggestions with voting.
- **Roadmaps** — Public or private plans tied to incoming feedback.
- **Changelogs** — Ship notes that close the loop with requesters.
- **Workspace** — Team members, branding, integrations, and embeddable widget.

## Links

- [Pricing](${pricing}): Free, Starter ($24/month), Professional ($47/month); flat workspace plans, not per-seat.
- [Documentation](${docs}): Boards, roadmap, changelog, widget, and custom domains.
- [Sign up](${signup})
`
}

export function renderPricingMarkdown() {
  const rows = PRICING_PLAN_ORDER.map((key) => {
    const plan = PRICING_PLANS[key]
    return `| ${plan.name} | ${formatPricingPrice(plan, "monthly")} | ${formatPricingPrice(plan, "yearly")} | ${plan.note} |`
  }).join("\n")

  const sections = PRICING_PLAN_ORDER.map((key) => {
    const plan = PRICING_PLANS[key]
    const highlights = plan.highlights
      .map((item) => `- ${item.label}: ${item.value}`)
      .join("\n")
    const features = plan.features.map((feature) => `- ${feature.title}`).join("\n")
    return `## ${plan.name}

${plan.note}. ${formatPricingPrice(plan, "monthly")}, or ${formatPricingPrice(plan, "yearly")}.

${highlights}

${features}

[Get started](${plan.href})
`
  }).join("\n")

  return `# Featul Pricing

Featul uses flat workspace plans (not per-seat billing). Prices are in USD and exclude applicable taxes. Start on Free, then move to Starter or Professional as the team grows.

| Plan | Monthly | Yearly | Notes |
| --- | --- | --- | --- |
${rows}

${sections}`
}

export function renderLlmsTxt() {
  const free = PRICING_PLANS.free
  const starter = PRICING_PLANS.starter
  const professional = PRICING_PLANS.professional

  return `# Featul
> ${DEFAULT_DESCRIPTION}

Featul is customer feedback, public or private roadmaps, and changelogs in one EU-hosted workspace. Plans are billed per workspace, not per seat. Prefer the Markdown twins linked below over HTML.

## Product
- [What Featul is](${mdUrl("/")}): Feedback boards, voting, roadmaps, changelogs, branding, and custom domains.
- [Pricing](${mdUrl("/pricing")}): ${free.name} ($${free.monthlyPrice}/month), ${starter.name} ($${starter.monthlyPrice}/month), ${professional.name} ($${professional.monthlyPrice}/month).
- [What is Featul?](${mdUrl("/docs/getting-started/overview")}): Product overview for agents and humans.
- [Getting Started](${mdUrl("/docs/getting-started")}): Create a workspace, boards, and first roadmap.
- [Docs index](${absoluteUrl("/docs/llms.txt")}): Curated documentation for coding agents.

## Compare
- [Alternatives](${absoluteUrl("/alternatives")}): Best Featurebase and Canny alternatives in 2026, with pricing, open source, and EU hosting compared.
- [Featurebase alternatives](${absoluteUrl("/alternatives/featurebase")}): Open source Featurebase alternative with self-hosting.
- [Canny alternatives](${absoluteUrl("/alternatives/canny")}): Canny alternative with Canny import and Slack/API integrations.
- [UserJot alternatives](${absoluteUrl("/alternatives/userjot")}): Product feedback platform with public roadmap and changelog.
- [Productboard alternatives](${absoluteUrl("/alternatives/productboard")}): Customer-facing feedback without a full PM suite.
- [Beamer alternatives](${absoluteUrl("/alternatives/beamer")}): Changelog plus feature voting in one workspace.
- [Fider alternatives](${absoluteUrl("/alternatives/fider")}): Open source product feedback with a hosted EU option.

## Learn
- [What is ARR?](${absoluteUrl("/definitions/arr")}): Annual Recurring Revenue definition, formula, and ARR vs MRR.
- [ARR calculator](${absoluteUrl("/tools/categories/revenue-growth/arr-calculator")}): Annualize MRR and use ARR to weight B2B feedback.
- [Use cases](${absoluteUrl("/use-cases")}): Product feedback, B2B ARR-weighted requests, and public roadmaps.

## Optional
- [Blog](${absoluteUrl("/blog")})
- [Privacy](${absoluteUrl("/privacy")})
- [Terms](${absoluteUrl("/terms")})
`
}

export function renderDocsLlmsTxt() {
  const sections = docsSections
    .map((section) => {
      const items = section.items
        .map((item) => `- [${item.label}](${mdUrl(item.href)})`)
        .join("\n")
      return `## ${section.label}\n${items}`
    })
    .join("\n\n")

  return `# Featul Docs
> Documentation for Featul: product feedback boards, roadmaps, changelogs, branding, and the embed widget.

Use these Markdown pages instead of the HTML docs UI. Start with the overview if you need to decide whether Featul fits a customer-feedback project.

${sections}
`
}

const LLMS_FULL_HTML_PATHS = [
  "/",
  "/pricing",
  "/docs/getting-started/overview",
  "/docs/getting-started",
] as const

export async function renderLlmsFullTxt() {
  const parts: string[] = [renderLlmsTxt().trim()]

  for (const htmlPath of LLMS_FULL_HTML_PATHS) {
    const body = await resolveMarkdown(htmlPath)
    if (!body) continue
    const twin = htmlPathToMarkdownPath(htmlPath) ?? htmlPath
    parts.push(`---\n\n# ${twin}\n\n${body.trim()}`)
  }

  return `${parts.join("\n\n")}\n`
}

export async function renderDocsPageMarkdown(pathname: string) {
  const nav = findDocsNav(pathname)
  if (!nav) return null

  const docs = await readDocsMarkdown(nav.item.id as DocsPageId)
  return `${docs.content.trim()}\n`
}

export async function resolveMarkdown(pathname: string): Promise<string | null> {
  const normalized = normalizeMarkdownPathname(pathname)

  if (normalized === "/" || normalized === "/index") {
    return renderHomepageMarkdown()
  }
  if (normalized === "/pricing") {
    return renderPricingMarkdown()
  }
  if (normalized === "/docs/llms.txt" || normalized === "/docs/llms") {
    return renderDocsLlmsTxt()
  }
  if (normalized === "/docs" || normalized.startsWith("/docs/")) {
    return renderDocsPageMarkdown(normalized)
  }

  return null
}

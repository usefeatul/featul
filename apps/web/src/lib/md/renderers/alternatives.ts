import {
  ALTERNATIVES_UPDATED_ISO,
  ALTERNATIVES_UPDATED_LABEL,
  getAllAlternatives,
  getAlternativeBySlug,
  type Alternative,
  type FeatureSupport,
} from "@/config/alternatives"
import {
  ROUNDUP_CRITERIA,
  ROUNDUP_FAQS,
  ROUNDUP_PICKS,
  ROUNDUP_TOOLS,
  ROUNDUP_UPDATED_LABEL,
  ROUNDUP_YEAR,
} from "@/config/alternatives-roundup"
import { getAlternativeFaq } from "@/data/alt"
import { getAlternativeRelatedLinks } from "@/lib/seo/interlink"
import { getAltDescription } from "@/types/descriptions"
import { blocks, faq, heading, link, linkList, list, table } from "../format"
import type { MarkdownRegistry } from "../types"

// Keep in sync with: src/app/(site)/alternatives/page.tsx (metadata) and components/alternatives/intro.tsx
const HUB_TITLE = `Best Featurebase alternatives ${ROUNDUP_YEAR}`
const HUB_SUMMARY =
  "Compare the best Featurebase and Canny alternatives in 2026. Featul, Frill, UserJot, and Productboard side by side on pricing, open source, EU hosting, and changelogs."
const HUB_LEAD =
  "Side-by-side Featurebase and Canny alternatives: Featul, Frill, UserJot, Productboard, and Nolt, compared on pricing, open source, EU hosting, roadmaps, and changelogs."

// Same defaults as components/alternatives/why.tsx.
const DEFAULT_VICTORY_POINTS = [
  "EU hosting and GDPR-friendly defaults out of the box",
  "Unified feedback boards, public roadmap, and changelog",
  "Faster setup without enterprise implementation overhead",
]

function support(value: FeatureSupport) {
  if (value === "partial") return "Partial"
  return value ? "Yes" : "No"
}

function sortedAlternatives() {
  return getAllAlternatives().sort((a, b) => a.name.localeCompare(b.name))
}

function pageTitle(alt: Alternative) {
  const title = alt.heroTitle ?? `Best ${alt.name} alternative`
  const kicker = alt.heroKicker ?? `Featul vs ${alt.name}`
  return `${title}: ${kicker}`
}

function renderHub() {
  const alternatives = sortedAlternatives()

  const roundupTable = table(
    ["Tool", "Best for", "Pricing", "Open source", "Self-host", "EU hosting", "Roadmap + changelog"],
    ROUNDUP_TOOLS.map((tool) => [
      link(tool.name, tool.href),
      tool.bestFor,
      tool.pricing,
      tool.openSource,
      tool.selfHost,
      tool.euHosting,
      tool.roadmapChangelog,
    ]),
  )

  const body = blocks(
    HUB_LEAD,
    heading(2, `What are the best Featurebase alternatives in ${ROUNDUP_YEAR}?`),
    "Featul, Canny, Frill, and UserJot. Featul if you want open source and EU hosting. Canny if you need the biggest integration catalog. Featurebase if the help center is already your system of record.",
    roundupTable,
    `As of ${ROUNDUP_UPDATED_LABEL}. Featul Starter is £18 per workspace per month. Check live vendor pages before you buy.`,
    heading(2, "What to look for"),
    ROUNDUP_CRITERIA.map((item) => `${heading(3, item.title)}\n\n${item.body}`).join("\n\n"),
    heading(2, "Which tool is the best X for Y?"),
    "Pick by job, not by brand. Featul is in this list when it actually fits.",
    ROUNDUP_PICKS.map((pick) => `${heading(3, pick.title)}\n\n${pick.body}`).join("\n\n"),
    heading(2, "Every Featul vs page"),
    `${alternatives.length} comparisons. Detailed Featurebase, Canny, Productboard, and other alternative pages with feature tables, migration notes, and honest tradeoffs.`,
    linkList(
      alternatives.map((alt) => ({
        label: `${alt.name} alternatives`,
        href: `/alternatives/${alt.slug}`,
        description: alt.summary,
      })),
    ),
    heading(2, "FAQs about Featurebase and Canny alternatives"),
    ROUNDUP_FAQS.description,
    faq(ROUNDUP_FAQS.items),
  )

  return {
    title: HUB_TITLE,
    summary: HUB_SUMMARY,
    path: "/alternatives",
    updated: ALTERNATIVES_UPDATED_ISO,
    body,
  }
}

function renderAlternative(slug: string) {
  const alt = getAlternativeBySlug(slug)
  if (!alt) return null

  const description = getAltDescription(slug, "first")
  const tldrTradeoffs = alt.tradeoffs?.slice(0, 2) ?? alt.pros?.slice(0, 2) ?? []
  const tldrWins = alt.victoryPoints?.slice(0, 3) ?? []
  const whyPoints = (alt.victoryPoints?.length ? alt.victoryPoints : DEFAULT_VICTORY_POINTS).slice(0, 4)
  const tagline = alt.tagline?.toLowerCase() || "product feedback"
  const { description: faqDescription, items: faqItems } = getAlternativeFaq(slug)

  const body = blocks(
    heading(2, `${alt.name} vs Featul: what is the short answer?`),
    `Updated ${ALTERNATIVES_UPDATED_LABEL}.`,
    heading(3, alt.name),
    alt.website ? `Website: ${alt.website}` : null,
    alt.summary ?? description,
    tldrTradeoffs.length ? list(tldrTradeoffs) : null,
    heading(3, "Featul"),
    `Featul is a modern, privacy-first ${alt.name} alternative with EU hosting by default and an end-to-end workflow: feedback boards, public roadmap, and changelog.`,
    tldrWins.length ? list(tldrWins) : null,
    alt.snapshot?.length
      ? blocks(
          heading(2, `How do Featul and ${alt.name} compare at a glance?`),
          alt.snapshotLead ??
            `${alt.name} and Featul both collect product feedback. Pricing, hosting, and whether roadmap and changelog live in the same product.`,
          table(
            ["Criteria", alt.name, "Featul"],
            alt.snapshot.map((row) => [row.label, row.competitor, row.featul]),
          ),
          `${alt.name} vs Featul comparison as of ${ALTERNATIVES_UPDATED_LABEL}.`,
        )
      : null,
    heading(2, `How do Featul and ${alt.name} compare on features?`),
    `Where ${alt.name} and Featul match, and where they do not. Yes = included, Partial = limited or extra setup, No = not available.`,
    table(
      ["Feature", "Description", alt.name, "Featul"],
      alt.features.map((feature) => [
        feature.label,
        feature.description ?? "",
        support(feature.competitor),
        support(feature.Featul),
      ]),
    ),
    heading(2, `Why do teams choose Featul over ${alt.name}?`),
    alt.snapshotLead ??
      `${alt.name} is known for ${tagline}. Featul is a strong ${alt.name} alternative when you want privacy-first defaults, a connected feedback-to-changelog workflow, and less setup overhead.`,
    list(whyPoints.map((point) => point.replace(/\.$/, "").trim())),
    `Compared with ${alt.name}, each of these helps product teams move from raw feedback to shipped updates without juggling separate tools.`,
    alt.guide?.length
      ? blocks(
          `Direct answers before you switch from ${alt.name}.`,
          alt.guide
            .map((section) => blocks(heading(2, section.title), section.answer, section.body))
            .join("\n\n"),
        )
      : null,
    heading(2, `FAQs about ${alt.name} alternatives`),
    faqDescription,
    faq(faqItems.slice(0, 8)),
  )

  return {
    title: pageTitle(alt),
    summary: description,
    path: `/alternatives/${slug}`,
    updated: ALTERNATIVES_UPDATED_ISO,
    body,
    related: getAlternativeRelatedLinks(slug).map((item) => ({ label: item.label, href: item.href })),
  }
}

/** Tools featured in the roundup first, in roundup order; the rest stay alphabetical. */
function byImportance<T extends { slug: string; name: string }>(alts: T[]) {
  const rank = new Map(ROUNDUP_TOOLS.map((tool, index) => [tool.name.toLowerCase(), index]))
  const score = (alt: T) => rank.get(alt.name.toLowerCase()) ?? Number.MAX_SAFE_INTEGER
  return [...alts].sort((a, b) => score(a) - score(b))
}

export const alternativesRoutes = {
  "/alternatives": {
    section: "compare",
    static: true,
    entries: () => [{ path: "/alternatives", title: HUB_TITLE, description: HUB_SUMMARY }],
    render: () => renderHub(),
  },
  "/alternatives/[slug]": {
    section: "compare",
    static: true,
    // ~8k chars each; llms-full.txt keeps the most-compared tools (roundup order first).
    fullLimit: 15,
    entries: () =>
      byImportance(sortedAlternatives()).map((alt) => ({
        path: `/alternatives/${alt.slug}`,
        title: `${alt.name} alternatives`,
        description: alt.summary ?? getAltDescription(alt.slug, "first"),
      })),
    render: ({ slug }) => (slug ? renderAlternative(slug) : null),
  },
} satisfies Pick<MarkdownRegistry, "/alternatives" | "/alternatives/[slug]">

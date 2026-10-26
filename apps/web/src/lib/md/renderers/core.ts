import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/config/seo"
import { faqItems } from "@/data/faqs"
import {
  homeAccess,
  homeConversion,
  homeFaq,
  homeFeatures,
  homeHero,
  homeIntegrations,
  pricingCopy,
} from "@/data/home"
import { PRICING_PLAN_ORDER, PRICING_PLANS, formatPricingPrice, summarizePricingPlans } from "@/types/plan"
import { blocks, faq, heading, link, list, table } from "../format"
import type { MarkdownRegistry } from "../types"

// Keep in sync with the `metadata` export of src/app/(site)/pricing/page.tsx.
export const PRICING_SUMMARY = "Simple, honest pricing with a free tier and startup‑friendly plans."

function renderPlans() {
  const rows = PRICING_PLAN_ORDER.map((key) => {
    const plan = PRICING_PLANS[key]
    return [plan.name, formatPricingPrice(plan, "monthly"), formatPricingPrice(plan, "yearly"), plan.note]
  })
  const limits = PRICING_PLANS.free.highlights.map((highlight) => [
    highlight.label,
    ...PRICING_PLAN_ORDER.map(
      (key) => PRICING_PLANS[key].highlights.find((item) => item.label === highlight.label)?.value ?? "",
    ),
  ])

  const plans = PRICING_PLAN_ORDER.map((key) => {
    const plan = PRICING_PLANS[key]
    return blocks(
      heading(3, plan.name),
      `${plan.note}. ${formatPricingPrice(plan, "monthly")}, or ${formatPricingPrice(plan, "yearly")}.`,
      list(plan.features.map((feature) => feature.title)),
      [plan.finePrint, key !== "free" ? `Yearly billing: ${pricingCopy.yearlyNote}` : "", plan.trialDays ? `${plan.trialDays}-day free trial. ${pricingCopy.trialNote}` : ""]
        .filter(Boolean)
        .join(" "),
    )
  })

  return blocks(
    table(["Plan", "Monthly", "Yearly", "For"], rows),
    heading(2, "Limits"),
    table(["", ...PRICING_PLAN_ORDER.map((key) => PRICING_PLANS[key].name)], limits),
    heading(2, "Plans"),
    plans.join("\n\n"),
  )
}

export const coreRoutes = {
  "/": {
    section: "core",
    static: true,
    entries: () => [
      {
        path: "/",
        title: "Home",
        description: "What Featul is: feedback boards, voting, roadmaps, changelogs, widget, and custom domains.",
      },
    ],
    render: () => ({
      title: `${SITE_NAME}: ${homeHero.title} ${homeHero.highlight}`,
      summary: DEFAULT_DESCRIPTION,
      path: "/",
      body: blocks(
        homeHero.description,
        heading(2, homeConversion.title),
        homeConversion.description,
        homeConversion.steps
          .map((step) => blocks(heading(3, `${step.number}. ${step.label}: ${step.title}`), step.body))
          .join("\n\n"),
        heading(2, `${homeFeatures.title} ${homeFeatures.highlight}`),
        homeFeatures.description,
        list(
          Object.values(homeFeatures.cards).map((card) =>
            `**${card.title}** ${card.body}${"href" in card && card.href ? ` (${link("docs", card.href)})` : ""}`,
          ),
        ),
        heading(2, homeAccess.title),
        homeAccess.description,
        list(homeAccess.items.map((item) => `**${item.name}.** ${item.description}`)),
        heading(2, homeIntegrations.title),
        homeIntegrations.description,
        list(
          homeIntegrations.items.map(
            (item) => `${link(item.name, `/integrations/${item.slug}`)}: ${item.description}`,
          ),
        ),
        heading(2, "Pricing"),
        renderPlans().split("\n## Limits")[0]!,
        heading(2, homeFaq.title),
        homeFaq.description,
        faq(faqItems),
      ),
      related: [
        { label: "Pricing", href: "/pricing" },
        { label: "Documentation", href: "/docs/getting-started/overview" },
        { label: "Featurebase and Canny alternatives", href: "/alternatives" },
        { label: "Integrations", href: "/integrations" },
        { label: "Use cases", href: "/use-cases" },
      ],
    }),
  },
  "/pricing": {
    section: "core",
    static: true,
    entries: () => [
      {
        path: "/pricing",
        title: "Pricing",
        description: `${summarizePricingPlans()}; flat per-workspace plans in GBP, not per seat.`,
      },
    ],
    render: () => ({
      title: `Pricing: ${pricingCopy.title} ${pricingCopy.highlight}`,
      summary: PRICING_SUMMARY,
      path: "/pricing",
      body: blocks(
        `${pricingCopy.description} Prices are in GBP. Plans are billed per workspace, not per seat.`,
        renderPlans(),
        heading(2, homeFaq.title),
        faq(faqItems),
      ),
      related: [
        { label: "Featul home", href: "/" },
        { label: "Getting started", href: "/docs/getting-started" },
        { label: "Featurebase and Canny alternatives", href: "/alternatives" },
      ],
    }),
  },
} satisfies Pick<MarkdownRegistry, "/" | "/pricing">

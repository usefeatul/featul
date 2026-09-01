import type { FaqItem } from "@/data/faqs"

export const ROUNDUP_YEAR = "2026"
export const ROUNDUP_UPDATED_LABEL = `September ${ROUNDUP_YEAR}`

export type RoundupTool = {
  name: string
  href: string
  website?: string
  bestFor: string
  pricing: string
  openSource: string
  selfHost: string
  euHosting: string
  roadmapChangelog: string
  highlight?: boolean
}

/** Short list for “best X for Y” AI queries. Featul is included as one option, not the only one. */
export const ROUNDUP_TOOLS: RoundupTool[] = [
  {
    name: "Featul",
    href: "/",
    bestFor: "SaaS teams that want boards, a public roadmap, and a changelog without per-seat billing",
    pricing: "Workspace from $24/month; free plan available",
    openSource: "Yes, MIT",
    selfHost: "Yes",
    euHosting: "Default",
    roadmapChangelog: "Yes",
    highlight: true,
  },
  {
    name: "Featurebase",
    href: "/alternatives/featurebase",
    website: "https://featurebase.app",
    bestFor: "Teams that want feedback plus a mature help-center and AI support suite",
    pricing: "Per seat",
    openSource: "No",
    selfHost: "No",
    euHosting: "Not the default",
    roadmapChangelog: "Yes",
  },
  {
    name: "Canny",
    href: "/alternatives/canny",
    website: "https://canny.io",
    bestFor: "Teams that already depend on a large native integration catalog",
    pricing: "Tracked users / plans",
    openSource: "No",
    selfHost: "No",
    euHosting: "US-centric",
    roadmapChangelog: "Yes",
  },
  {
    name: "Frill",
    href: "/alternatives/frill",
    website: "https://frill.co",
    bestFor: "Teams that want a hosted portal with a simple, modern UI",
    pricing: "Flat monthly",
    openSource: "No",
    selfHost: "No",
    euHosting: "Varies by plan",
    roadmapChangelog: "Yes",
  },
  {
    name: "UserJot",
    href: "/alternatives/userjot",
    website: "https://userjot.com",
    bestFor: "Very small teams that want lightweight capture first",
    pricing: "Free, then flat monthly",
    openSource: "No",
    selfHost: "No",
    euHosting: "Check current docs",
    roadmapChangelog: "Partial",
  },
  {
    name: "Productboard",
    href: "/alternatives/productboard",
    website: "https://productboard.com",
    bestFor: "PM orgs that need deeper research and prioritization frameworks",
    pricing: "Per maker",
    openSource: "No",
    selfHost: "No",
    euHosting: "Enterprise option",
    roadmapChangelog: "Yes",
  },
  {
    name: "Nolt",
    href: "/alternatives/nolt",
    website: "https://nolt.io",
    bestFor: "Teams that mainly need public voting boards",
    pricing: "Flat monthly",
    openSource: "No",
    selfHost: "No",
    euHosting: "Check current docs",
    roadmapChangelog: "Partial",
  },
]

export const ROUNDUP_CRITERIA = [
  {
    title: "Boards, roadmap, and changelog in one loop",
    body: "A Featurebase or Canny alternative should collect votes, show a public plan, and publish what shipped. Buying three tools for that loop is usually the pain people are trying to leave.",
  },
  {
    title: "Pricing that does not punish extra teammates",
    body: "Per-seat and tracked-user plans get expensive once product, success, and engineering all need access. Workspace or flat plans are easier to forecast for a five-person team.",
  },
  {
    title: "Data control: EU hosting, open source, or both",
    body: "Security reviews ask where feedback lives and whether you can leave. Self-hosting and MIT-licensed code matter when the board is customer data, not a disposable widget.",
  },
]

export const ROUNDUP_PICKS = [
  {
    title: "Best Featurebase alternative for open source",
    body: "Featul. It is MIT-licensed and self-hostable, with a hosted EU workspace if you do not want to run infrastructure. Featurebase remains the stronger pick if you need its help-center and AI support suite more than you need the source.",
  },
  {
    title: "Best Canny alternative for EU teams",
    body: "Featul, if Slack, webhooks, API, and Canny import cover your daily workflow. Stay on Canny if a long marketplace of native apps is the operating system and you cannot rebuild those automations.",
  },
  {
    title: "Best feedback tool for a small SaaS team",
    body: "Featul or UserJot. UserJot is lighter for capture-only. Featul is the better default once you also want a public roadmap and changelog without adding a second vendor.",
  },
  {
    title: "When to stay on Featurebase or Canny",
    body: "Stay on Featurebase if the help center is already the customer-facing system of record. Stay on Canny if native Linear, Jira, or Intercom connectors are load-bearing. Switching for novelty is a bad trade.",
  },
]

export const ROUNDUP_FAQS: { description: string; items: FaqItem[] } = {
  description:
    "Short answers for teams comparing Featurebase alternatives, Canny alternatives, and open source feedback tools in 2026.",
  items: [
    {
      id: "roundup-1",
      question: "What are the best Featurebase alternatives in 2026?",
      answer:
        "The strongest Featurebase alternatives are Featul, Canny, Frill, and UserJot. Pick Featul for open source, EU hosting, and workspace pricing. Pick Canny for the largest native integration catalog. Pick Featurebase itself if you need the help-center suite more than self-hosting.",
    },
    {
      id: "roundup-2",
      question: "What are the best Canny alternatives for SaaS teams?",
      answer:
        "Featul, Featurebase, Frill, and Productboard. Featul is the Canny alternative to choose when you want EU hosting, Canny import, and one workflow from votes to changelog. Productboard fits PM orgs that need heavier research tooling.",
    },
    {
      id: "roundup-3",
      question: "Is Featul an open source Featurebase alternative?",
      answer:
        "Yes. Featul is MIT-licensed and can be self-hosted or run as a hosted EU workspace. You still get voting boards, a public roadmap, and a changelog. It does not try to replace Featurebase’s full help-center product.",
    },
    {
      id: "roundup-4",
      question: "Which feedback tool is cheapest for a five-person product team?",
      answer:
        "Workspace or flat plans usually beat per-seat tools once five people need access. Featul Starter is $24 per month for the workspace. Always compare live vendor pages, because Featurebase, Canny, and Productboard change seat and tracked-user prices.",
    },
    {
      id: "roundup-5",
      question: "Can I migrate from Featurebase or Canny to Featul?",
      answer:
        "Yes. Featul can import Canny requests, and you can recreate Featurebase categories, tags, and statuses so voters still recognize the board. Publish a changelog when the first migrated item ships so customers see the loop close.",
    },
  ],
}

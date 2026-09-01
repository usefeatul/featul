import type { Alternative } from "@/config/alternatives"
import type { FaqItem } from "@/data/faqs"

export type CompetitorKind =
  | "voting-board"
  | "feedback-suite"
  | "changelog"
  | "product-management"
  | "visual-feedback"
  | "open-source"
  | "b2b-feedback"
  | "linear"

const FEATUL = {
  pricing: "Flat workspace; Starter $24/month, Professional $47/month",
  openSource: "Yes, MIT License",
  selfHost: "Yes, or a hosted EU workspace",
  hosting: "EU by default",
  loop: "Boards, public roadmap, and changelog in one product",
}

export type CompetitorDetail = {
  kind: CompetitorKind
  metaTitle: string
  heroTitle: string
  heroKicker: string
  description: string
  summary: string
  snapshotLead: string
  pricing: string
  hosting: string
  openSource: string
  selfHost: string
  extra: { label: string; competitor: string; featul: string }
  bestForThem: string
  bestForFeatul: string
  stayIf: string
  migrate: string
  unique: string
}

function extraBody(name: string, d: CompetitorDetail): string {
  return `On ${d.extra.label}, ${name} is ${d.extra.competitor}. Featul is ${d.extra.featul}. That is usually the real split, not a feature-for-feature clone.`
}

function snapshot(name: string, d: CompetitorDetail): Alternative["snapshot"] {
  return [
    { label: "Pricing model", competitor: d.pricing, featul: FEATUL.pricing },
    { label: "Open source", competitor: d.openSource, featul: FEATUL.openSource },
    { label: "Self-hosting", competitor: d.selfHost, featul: FEATUL.selfHost },
    { label: "Default hosting", competitor: d.hosting, featul: FEATUL.hosting },
    d.extra,
    {
      label: "Product feedback loop",
      competitor:
        d.kind === "changelog"
          ? "Changelog first; feedback often extra"
          : d.kind === "open-source"
            ? "Voting board; roadmap and changelog limited"
            : d.kind === "product-management"
              ? "Internal PM workflows first"
              : d.kind === "visual-feedback"
                ? "Visual bugs first"
                : d.kind === "b2b-feedback"
                  ? "CRM-weighted requests first"
                  : d.kind === "linear"
                    ? "Linear-native inbox first"
                    : d.kind === "feedback-suite"
                      ? "Full suite; portal is one slice"
                      : "Voting board; roadmap and changelog vary",
      featul: FEATUL.loop,
    },
    { label: "Best for", competitor: d.bestForThem, featul: d.bestForFeatul },
  ]
}

function guide(name: string, d: CompetitorDetail): NonNullable<Alternative["guide"]> {
  const alt = `${name} alternative`
  switch (d.kind) {
    case "changelog":
      return [
        {
          title: `Is Featul a good ${name} alternative for changelogs?`,
          answer: `Yes if you also need a product feedback board and a public roadmap. Featul publishes a changelog in the same EU-hosted workspace as votes. ${name} is the stronger pick when announcements and widgets are the whole job.`,
          body: d.unique,
        },
        {
          title: `Can Featul replace ${name} plus a separate feedback tool?`,
          answer: `That is the usual stack Featul replaces: ${name} for release notes, something else for feature voting. Featul keeps boards, a public roadmap, and a changelog together so SaaS teams are not paying two vendors to close the loop.`,
          body: `Workspace pricing starts at $24/month. Open source (MIT) and self-hosting are available if the changelog is customer-facing data you may need to move.`,
        },
        {
          title: `Does Featul include a public roadmap unlike ${name}?`,
          answer: `Yes. Featul’s public roadmap is tied to the same posts that get votes. Customers see Planned, In Progress, and Shipped, then a changelog when work lands. ${name} can still win on announcement polish and in-app widgets.`,
          body: extraBody(name, d),
        },
        {
          title: `How do I migrate from ${name} to Featul?`,
          answer: d.migrate,
          body: `Keep the first shipped item honest: publish a Featul changelog so readers see the loop close, not just a new vendor URL.`,
        },
        {
          title: `Is Featul an EU-hosted, open source product feedback platform?`,
          answer: `Yes. Featul is a privacy-first product feedback platform with EU hosting by default, MIT-licensed source, and optional self-hosting. Boards, voting, public roadmap, and changelog share one workspace.`,
          body: `If GDPR or self-hosting is on your checklist, that is the combination you are buying: a changelog next to the board, in the EU, with source you can take with you.`,
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Switch when you also need feature voting and a public roadmap in the same tool, or when EU hosting and workspace pricing matter more than announcement chrome.`,
        },
      ]
    case "product-management":
      return [
        {
          title: `Is Featul a ${name} alternative or a different product?`,
          answer: `Featul is a product feedback platform, not a full ${name} replacement. Use Featul for voting boards, a public roadmap, and a changelog. Keep ${name} if research, scoring frameworks, and internal PM workflows are the job.`,
          body: d.unique,
        },
        {
          title: `When is Featul the better ${name} alternative for customer-facing feedback?`,
          answer: `When the pain is a public portal customers will actually use, not a private research database. Featul is EU-hosted, open source, and billed per workspace from $24/month so a five-person product team does not buy seats they will not fill.`,
          body: `Featul is a better fit for ${d.bestForFeatul}. ${name} is a better fit for ${d.bestForThem}. Match the tool to the job, not the other way around.`,
        },
        {
          title: `Does Featul include a public roadmap and changelog?`,
          answer: `Yes. Featul links feature requests to roadmap columns and publishes release notes in the same workspace. That is the customer-facing slice of ${name} most SaaS teams actually share with users.`,
          body: `Featul does not try to out-model ${name} on internal prioritization. It tries to close the loop from vote to shipped.`,
        },
        {
          title: `How do I migrate customer feedback from ${name} to Featul?`,
          answer: d.migrate,
          body: `Map statuses customers already know. Then changelog the first imported item that ships so the portal feels alive.`,
        },
        {
          title: `Is Featul cheaper than ${name} for a small SaaS team?`,
          answer: `Usually, if you only needed ${name} for a public roadmap and feedback. Featul Starter is $24 per workspace per month. ${d.pricing}. Compare live ${name} quotes before you treat this as a bid.`,
          body: `If your org lives in ${name} for strategy, stay. If you bought it as a Featurebase-style portal, Featul is the lighter ${alt}.`,
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Choose Featul when EU hosting, open source, and a simple product feedback loop beat a heavier PM suite.`,
        },
      ]
    case "visual-feedback":
      return [
        {
          title: `Is Featul a good ${name} alternative?`,
          answer: `Yes for product feedback boards, voting, a public roadmap, and a changelog. No if screenshot-and-annotate bug capture is the product. ${name} wins at visual markup. Featul wins at the customer-facing feedback loop.`,
          body: d.unique,
        },
        {
          title: `Can Featul replace ${name} for feature requests?`,
          answer: `For feature voting and a public roadmap, yes. Keep ${name} (or a similar tool) if engineers need annotated screenshots as the default intake. Many teams run Featul for the portal and a bug tool for pixels.`,
          body: extraBody(name, d),
        },
        {
          title: `How does Featul pricing compare to ${name}?`,
          answer: `Featul uses flat workspace plans from $24/month, MIT-licensed, EU-hosted. ${d.pricing}. A five-person product team usually pays less on a workspace cap than on tools that scale with seats or sessions.`,
          body: `Always check live ${name} pricing. Featul’s number is the published Starter plan.`,
        },
        {
          title: `How do I migrate from ${name} to Featul?`,
          answer: d.migrate,
          body: `Visual attachments can come later. Get the board, tags, and statuses recognizable first.`,
        },
        {
          title: `Is Featul an open source product feedback platform with EU hosting?`,
          answer: `Yes. Featul is MIT-licensed, self-hostable, and EU-hosted by default. You get boards, votes, a public roadmap, and a changelog without locking feedback into a closed vendor.`,
          body: `If GDPR or self-hosting is on the list, that is what you are buying, not a screenshot widget.`,
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Switch when you need a public product feedback portal more than visual bug widgets.`,
        },
      ]
    case "open-source":
      return [
        {
          title: `Is Featul a good ${name} alternative?`,
          answer: `Yes if you want open source plus a hosted EU product feedback platform: boards, public roadmap, and changelog, billed per workspace. ${name} remains a strong pick for a minimal self-hosted voting app with a smaller surface.`,
          body: d.unique,
        },
        {
          title: `How does Featul compare to ${name} on open source?`,
          answer: `Both can be self-hosted. Featul is MIT-licensed and also offers a hosted EU workspace so teams without ops still get EU hosting. Featul’s product loop includes roadmap and changelog, not only voting.`,
          body: extraBody(name, d),
        },
        {
          title: `Is Featul cheaper than running ${name} yourself?`,
          answer: `Hosted Featul Starter is $24/month. Self-hosting either tool trades vendor cost for engineering time. If you already run ${name} happily, do not switch for novelty. Switch when you want roadmap, changelog, and a supported EU workspace.`,
          body: `${name} pricing: ${d.pricing}. Featul Starter is $24 per workspace per month. Professional is $47. A PM, a CSM, and engineers share one bill.`,
        },
        {
          title: `How do I migrate from ${name} to Featul?`,
          answer: d.migrate,
          body: `Voters should still recognize titles and statuses. Changelog the first migrated ship.`,
        },
        {
          title: `Does Featul include a public roadmap and changelog?`,
          answer: `Yes. That is the usual gap teams hit after a pure voting board. Featul keeps feature requests, the public roadmap, and release notes in one privacy-first workspace.`,
          body: `If you also need a changelog or a public roadmap, that is the usual reason teams outgrow a voting-only board.`,
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Choose Featul for a fuller product feedback platform that is still open source.`,
        },
      ]
    case "linear":
      return [
        {
          title: `Is Featul a good ${name} alternative if we use Linear?`,
          answer: `Featul is a product feedback platform with boards, a public roadmap, and a changelog. It is not a Linear clone. Stay on ${name} if the Linear two-way sync is load-bearing. Choose Featul if you want an EU-hosted customer portal that works with any tracker via API and webhooks.`,
          body: d.unique,
        },
        {
          title: `What ${name} integrations does Featul replace?`,
          answer: `Slack alerts, webhooks, and API access cover the daily triage path. You will not get a purpose-built Linear UI. You keep the customer-facing loop: vote, show the roadmap, publish the changelog.`,
          body: extraBody(name, d),
        },
        {
          title: `How does Featul pricing compare to ${name}?`,
          answer: `Featul Starter is $24 per workspace per month. ${d.pricing}. Workspace pricing is the Featul bet: product, success, and engineering can all see the board without a seat tax.`,
          body: `Confirm live ${name} plans. Featul is MIT-licensed and self-hostable if Linear-adjacent data residency is the issue.`,
        },
        {
          title: `How do I migrate from ${name} to Featul?`,
          answer: d.migrate,
          body: `Reconnect Slack after import. Keep voting open on the new URL.`,
        },
        {
          title: `Is Featul an EU-hosted product feedback platform?`,
          answer: `Yes. EU hosting by default, GDPR-friendly defaults, open source, optional self-host. Public roadmap and changelog included.`,
          body: `If GDPR is on the security form, that is usually what “${alt}” is standing in for.`,
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Switch when you want a customer-facing Featul portal more than a Linear-native inbox.`,
        },
      ]
    case "b2b-feedback":
      return [
        {
          title: `Is Featul a good ${name} alternative for B2B feature requests?`,
          answer: `Yes when you want a public product feedback portal, voting, a public roadmap, and a changelog. ${name} still wins if CRM-tied, revenue-weighted requests are the operating system.`,
          body: d.unique,
        },
        {
          title: `Does Featul include a public roadmap and changelog?`,
          answer: `Yes. Featul is built as a product feedback platform for SaaS teams: boards, votes, public roadmap, changelog, EU hosting, workspace pricing from $24/month.`,
          body: `Featul is a better fit for ${d.bestForFeatul}. ${name} is a better fit for ${d.bestForThem}. Match the tool to the job, not the other way around.`,
        },
        {
          title: `How does Featul pricing compare to ${name}?`,
          answer: `${d.pricing}. Featul bills the workspace, not each teammate. Open source and self-hosting are available when feature-request data cannot sit only in a US CRM-adjacent tool.`,
          body: `Compare live quotes. Featul is not trying to replace your CRM.`,
        },
        {
          title: `How do I migrate from ${name} to Featul?`,
          answer: d.migrate,
          body: `Account names can live in tags. The public board should still look like the requests customers already voted on.`,
        },
        {
          title: `Is Featul EU-hosted and open source?`,
          answer: `Yes. MIT License, EU hosting by default, optional self-host. That is the privacy-first ${name} alternative for teams that still want a customer-facing loop.`,
          body: extraBody(name, d),
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Choose Featul when the public portal is the product, not the CRM report.`,
        },
      ]
    case "feedback-suite":
      return [
        {
          title: `Is Featul a good ${name} alternative?`,
          answer: `Yes if you want product feedback boards, a public roadmap, and a changelog without buying a broader suite. Featul is EU-hosted, open source, and billed per workspace from $24/month.`,
          body: d.unique,
        },
        {
          title: `How does Featul compare to ${name} as a product feedback platform?`,
          answer: `${name} is known as a fuller customer-feedback suite. Featul is the focused option: votes, a public roadmap, a changelog, a widget, Slack, and API. Stay on ${name} when the extra suite is already how you work.`,
          body: extraBody(name, d),
        },
        {
          title: `How does Featul pricing compare to ${name}?`,
          answer: `${d.pricing}. Featul Starter is $24/month for the workspace. A PM, CSM, and two engineers do not multiply the invoice the same way as per-seat tools.`,
          body: `Check live ${name} pricing. Featul’s published plans are Free, Starter, and Professional.`,
        },
        {
          title: `How do I migrate from ${name} to Featul?`,
          answer: d.migrate,
          body: `Map duplicates before go-live so vote counts stay honest.`,
        },
        {
          title: `Does Featul include EU hosting and a public roadmap?`,
          answer: `Yes. EU by default, GDPR-friendly defaults, MIT-licensed self-hosting optional. Public roadmap and changelog are in the same workspace as the board.`,
          body: `You get product feedback, a public roadmap, a changelog, and EU hosting in one workspace. That is usually why people compare Featul to ${name}.`,
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Switch when seat cost, data residency, or a second changelog tool is the pain.`,
        },
      ]
    default:
      return [
        {
          title: `Is Featul a good ${name} alternative?`,
          answer: `Yes if you want a product feedback platform with voting boards, a public roadmap, and a changelog. Featul is EU-hosted, open source (MIT), self-hostable, and billed per workspace from $24/month.`,
          body: d.unique,
        },
        {
          title: `Does Featul add a public roadmap and changelog ${name} teams often buy separately?`,
          answer: `Often yes. Featul keeps feature voting, the public roadmap, and release notes in one privacy-first workspace so you are not stitching a board to a changelog tool.`,
          body: `Featul is a better fit for ${d.bestForFeatul}. ${name} is a better fit for ${d.bestForThem}. Match the tool to the job, not the other way around.`,
        },
        {
          title: `How does Featul pricing compare to ${name}?`,
          answer: `${d.pricing}. Featul uses flat workspace plans: Starter $24/month, Professional $47/month. Adding teammates does not multiply the bill the same way as per-seat products.`,
          body: `Always compare live ${name} pages. Featul’s prices are the published workspace plans.`,
        },
        {
          title: `Can I migrate my ${name} board to Featul?`,
          answer: d.migrate,
          body: `Share the new board URL, keep voting open, and changelog the first shipped item from the old list.`,
        },
        {
          title: `Is Featul an EU-hosted, open source feedback tool?`,
          answer: `Yes. Featul is a privacy-first product feedback platform: EU hosting by default, MIT License, optional self-host, Slack/Discord, webhooks, and API.`,
          body: `If you also care about open source, GDPR, or a public roadmap, that is the combination Featul is selling.`,
        },
        {
          title: `Who should stay on ${name}?`,
          answer: d.stayIf,
          body: `Choose Featul when you want the full vote-to-changelog loop at workspace pricing.`,
        },
      ]
  }
}

function faqs(name: string, slug: string, d: CompetitorDetail): { description: string; items: FaqItem[] } {
  const kindExtra =
    d.kind === "changelog"
      ? `Featul also includes feature voting and a public roadmap, so you are not buying a board next to ${name}.`
      : d.kind === "product-management"
        ? `Featul is not a full ${name} suite. It covers the customer-facing slice: votes, a public roadmap, and a changelog.`
        : d.kind === "visual-feedback"
          ? `Featul does not replace screenshot markup. It replaces a missing public feedback portal.`
          : d.kind === "open-source"
            ? `Both can be self-hosted. Featul adds a hosted EU workspace, a public roadmap, and a changelog.`
            : d.kind === "linear"
              ? `Featul talks to any tracker through Slack, webhooks, and API. It is not a native Linear inbox.`
              : d.kind === "b2b-feedback"
                ? `Featul is the public portal. It is not a CRM-weighted request inbox.`
                : `Featul keeps feature voting, a public roadmap, and a changelog in one EU-hosted workspace.`

  return {
    description: d.description,
    items: [
      {
        id: `${slug}-1`,
        question: `What are the best ${name} alternatives in 2026?`,
        answer: `Most teams comparing ${name} alternatives want votes, a public roadmap, and a changelog in one place. Featul does that in an EU-hosted, open source workspace from $24/month. ${kindExtra}`,
      },
      {
        id: `${slug}-2`,
        question: `Is Featul a good ${name} alternative?`,
        answer: `Yes if you want boards, a public roadmap, and a changelog, with EU hosting and workspace pricing from $24/month. Featul is MIT licensed and you can self-host it.`,
      },
      {
        id: `${slug}-3`,
        question: `How does Featul vs ${name} pricing compare?`,
        answer: `${name}: ${d.pricing}. Featul bills the workspace. Starter is $24/month and Professional is $47/month. Adding a PM, a CSM, and engineers does not multiply the invoice the same way as per-seat tools.`,
      },
      {
        id: `${slug}-4`,
        question: `Does Featul include a public roadmap and changelog?`,
        answer: `Yes. Customers vote on a board, see Planned, In Progress, and Shipped on a public roadmap, and read a changelog when work ships.`,
      },
      {
        id: `${slug}-5`,
        question: `Is Featul an EU-hosted, open source product feedback platform?`,
        answer: `Yes. Hosting is in the EU by default, with GDPR-friendly defaults, an MIT license, and optional self-hosting.`,
      },
      {
        id: `${slug}-6`,
        question: `Can I migrate from ${name} to Featul?`,
        answer: d.migrate,
      },
      {
        id: `${slug}-7`,
        question: `When should I stay on ${name}?`,
        answer: d.stayIf,
      },
      {
        id: `${slug}-8`,
        question: `Does Featul replace ${name} for feature voting?`,
        answer: `For customer-facing feature voting, yes. You still get boards, votes, and comments, then a public roadmap and changelog. ${kindExtra} Stay on ${name} if the job is ${d.bestForThem}.`,
      },
    ],
  }
}

export const COMPETITOR_DETAILS: Record<string, CompetitorDetail> = {
  userjot: {
    kind: "voting-board",
    metaTitle: "UserJot alternatives | Product feedback + roadmap",
    heroTitle: "UserJot alternatives",
    heroKicker: "Featul vs UserJot",
    description:
      "Looking for UserJot alternatives? Featul is an open source product feedback platform with EU hosting, a public roadmap, and a changelog in one workspace.",
    summary:
      "UserJot is a lightweight feedback board. Featul is a UserJot alternative with a public roadmap, changelog, EU hosting, and MIT-licensed self-hosting.",
    snapshotLead:
      "Featul is a UserJot alternative for teams that outgrew capture-only. Both collect votes. Featul adds EU hosting, a public roadmap, and a changelog at workspace pricing.",
    pricing: "Free, then flat monthly",
    hosting: "Check current docs",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Roadmap and changelog",
      competitor: "Partial; capture is the focus",
      featul: "Included in the same workspace",
    },
    bestForThem: "Tiny teams that want the simplest capture UI",
    bestForFeatul: "SaaS teams that want a full product feedback loop",
    stayIf:
      "Stay on UserJot if the board is only a suggestion box and you do not need a public roadmap or changelog. Switch when customers ask what is planned and what shipped.",
    migrate:
      "Export posts, recreate tags and statuses in Featul, then share the new board. Embed the widget so capture stays in-product.",
    unique:
      "UserJot’s job is speed-to-first-vote. Featul’s job is the loop after that: prioritize on a public roadmap and close it with a changelog, without a second vendor.",
  },
  nolt: {
    kind: "voting-board",
    metaTitle: "Nolt alternatives | Voting, roadmap, changelog",
    heroTitle: "Nolt alternatives",
    heroKicker: "Featul vs Nolt",
    description:
      "Nolt alternatives for SaaS teams: Featul adds EU hosting, a public roadmap, and a changelog to the voting-board workflow, with open source and workspace pricing.",
    summary:
      "Nolt is known for public voting boards. Featul is a Nolt alternative with changelog, EU hosting, and a connected public roadmap.",
    snapshotLead:
      "Featul is a Nolt alternative when voting is not enough. Keep the board. Add a public roadmap and changelog under EU hosting.",
    pricing: "Flat monthly hosted plans",
    hosting: "Hosted; check residency",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Changelog",
      competitor: "Partial",
      featul: "Full changelog linked to feedback",
    },
    bestForThem: "Teams that mainly need a popular public board",
    bestForFeatul: "Teams that want votes plus shipped release notes",
    stayIf:
      "Stay on Nolt if the board UX is already loved and you do not need EU-first hosting or a first-class changelog. Switch when privacy reviews or a second announcement tool show up.",
    migrate:
      "Featul can import Nolt-style boards. Recreate categories, keep vote intent, point the public URL at Featul, connect Slack.",
    unique:
      "Nolt taught a lot of SaaS teams that a public board works. Featul is the Nolt alternative for the next step: privacy-first EU hosting and a changelog that closes the loop.",
  },
  upvoty: {
    kind: "voting-board",
    metaTitle: "Upvoty alternatives | EU-hosted product feedback",
    heroTitle: "Upvoty alternatives",
    heroKicker: "Featul vs Upvoty",
    description:
      "Upvoty alternatives with a public roadmap and changelog: Featul is an open source, EU-hosted product feedback platform billed per workspace, not per seat.",
    summary:
      "Upvoty keeps voting simple. Featul is an Upvoty alternative with EU hosting, a public roadmap, and a changelog in one workspace.",
    snapshotLead:
      "Featul is an Upvoty alternative for teams that want more than a clean voting UI: EU hosting, open source, roadmap, changelog.",
    pricing: "Hosted subscriptions from a low monthly floor",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Privacy defaults",
      competitor: "Standard SaaS",
      featul: "EU hosting and GDPR-friendly defaults",
    },
    bestForThem: "Teams that want the simplest voting flow",
    bestForFeatul: "Teams that need a privacy-first product feedback platform",
    stayIf:
      "Stay on Upvoty if voting-only is the product and hosting region does not matter. Switch when GDPR questionnaires or a public roadmap become the project.",
    migrate:
      "Import feedback, map tags and statuses, embed the Featul widget, publish the first changelog from a migrated request.",
    unique:
      "Upvoty’s strength is a focused voting UX. Featul’s strength is the rest of the product feedback platform: public roadmap, changelog, EU hosting, MIT self-host.",
  },
  productboard: {
    kind: "product-management",
    metaTitle: "Productboard alternatives | Public roadmap + feedback",
    heroTitle: "Productboard alternatives",
    heroKicker: "Feedback without the PM suite",
    description:
      "Productboard alternatives for customer-facing feedback: Featul is an EU-hosted product feedback platform with voting, a public roadmap, and a changelog, without a full PM suite.",
    summary:
      "Productboard is a product management platform. Featul is a Productboard alternative only for the public feedback, roadmap, and changelog slice.",
    snapshotLead:
      "Featul is not a full Productboard replacement. It is the Productboard alternative for teams that needed a customer portal, not a research OS.",
    pricing: "Per maker / per editor",
    hosting: "Enterprise residency options",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Job to be done",
      competitor: "Internal PM research and scoring",
      featul: "Customer-facing product feedback loop",
    },
    bestForThem: "PM orgs that live in research and scoring",
    bestForFeatul: "SaaS teams that need a public feedback portal",
    stayIf:
      "Stay on Productboard if insights, insights boards, and maker workflows are how the company plans. Switch if you bought Productboard as a Featurebase-style portal and never used the suite.",
    migrate:
      "Export customer-facing requests, recreate them on a Featul board, keep the public roadmap columns customers already know, drop the internal scoring model if you were not using it.",
    unique:
      "Most “Productboard alternative” searches from small SaaS teams are really “we need votes and a public roadmap.” Featul answers that search. It does not pretend to be Productboard for enterprise product ops.",
  },
  uservoice: {
    kind: "feedback-suite",
    metaTitle: "UserVoice alternatives | Modern product feedback",
    heroTitle: "UserVoice alternatives",
    heroKicker: "Featul vs UserVoice",
    description:
      "UserVoice alternatives for SaaS: Featul is a modern product feedback platform with EU hosting, workspace pricing, a public roadmap, and a changelog. Open source and self-host optional.",
    summary:
      "UserVoice is an established enterprise feedback suite. Featul is a UserVoice alternative with a simpler portal, EU hosting, and workspace pricing.",
    snapshotLead:
      "Featul is a UserVoice alternative when you want the portal without enterprise packaging. Boards, public roadmap, changelog, EU hosting.",
    pricing: "Enterprise-style packaging",
    hosting: "Commercial SaaS; check DPA",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Time to first board",
      competitor: "Heavier rollout",
      featul: "Minutes, not an implementation project",
    },
    bestForThem: "Enterprises standardized on UserVoice",
    bestForFeatul: "Product teams that want a lighter product feedback platform",
    stayIf:
      "Stay if procurement already signed UserVoice and support runbooks exist. Switch when the suite is more than you use and EU hosting or open source showed up in a security review.",
    migrate:
      "Export feature requests, recreate statuses, invite the team to a Featul workspace, connect Slack, changelog the first migrated ship.",
    unique:
      "UserVoice has the longer enterprise story. Featul has the shorter product: privacy-first product feedback, public roadmap, changelog, $24 workspace Starter.",
  },
  aha: {
    kind: "product-management",
    metaTitle: "Aha! alternatives | Customer-facing roadmaps",
    heroTitle: "Aha! alternatives",
    heroKicker: "Public roadmap without Aha!",
    description:
      "Aha! alternatives for a customer-facing roadmap: Featul is an EU-hosted product feedback platform with voting, public roadmap, and changelog, simpler than a full Aha! workspace.",
    summary:
      "Aha! is strategic roadmap software. Featul is an Aha! alternative only for public roadmaps tied to product feedback and a changelog.",
    snapshotLead:
      "Featul is an Aha! alternative for the public slice. Keep Aha! for strategy decks. Use Featul when customers need to vote and see what shipped.",
    pricing: "Suite pricing for roadmapping",
    hosting: "Commercial SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Audience",
      competitor: "Internal strategy and Jira-depth planning",
      featul: "Customers on a public roadmap",
    },
    bestForThem: "PMs presenting strategy to leadership",
    bestForFeatul: "SaaS teams sharing a public roadmap with users",
    stayIf:
      "Stay on Aha! if roadmaps are internal artifacts with deep Jira planning. Switch if the only Aha! surface customers see is a public page you could replace with Featul.",
    migrate:
      "Copy the public columns customers know, import the requests behind them, publish a Featul changelog for the next release.",
    unique:
      "Aha! is for planning. Featul is for the product feedback platform in front of customers. Mixing those jobs is how teams overpay.",
  },
  pendo: {
    kind: "product-management",
    metaTitle: "Pendo alternatives | Feedback without analytics bloat",
    heroTitle: "Pendo alternatives",
    heroKicker: "Feedback, not a full PX suite",
    description:
      "Pendo alternatives for feedback: Featul is a focused product feedback platform with boards, public roadmap, and changelog. EU-hosted and open source, without in-app analytics.",
    summary:
      "Pendo is a product experience suite. Featul is a Pendo alternative only if you needed feedback and a public roadmap, not session analytics and guides.",
    snapshotLead:
      "Featul does not replace Pendo analytics. It replaces the feedback-portal slice with EU hosting, voting, a public roadmap, and a changelog.",
    pricing: "Product-experience suite pricing",
    hosting: "Commercial SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "In-app analytics and guides",
      competitor: "Core product",
      featul: "Not the product; feedback loop only",
    },
    bestForThem: "Teams buying PX analytics and in-app guides",
    bestForFeatul: "Teams that only needed a feedback portal",
    stayIf:
      "Stay on Pendo if guides, NPS inside the product, and analytics are why you bought it. Switch the portal to Featul if Pendo is overkill for a public roadmap.",
    migrate:
      "Move feature-request themes onto a Featul board. Leave analytics in Pendo or elsewhere. Do not pretend Featul is a PX suite.",
    unique:
      "“Pendo alternative” for a five-person SaaS team often means “we wanted votes.” Featul is that product feedback platform. It is not Pendo.",
  },
  frill: {
    kind: "voting-board",
    metaTitle: "Frill alternatives | Roadmap, changelog, EU hosting",
    heroTitle: "Frill alternatives",
    heroKicker: "Featul vs Frill",
    description:
      "Frill alternatives for SaaS: Featul is an open source product feedback platform with EU hosting, public roadmap, changelog, and workspace pricing from $24/month.",
    summary:
      "Frill combines feedback, roadmaps, and announcements. Featul is a Frill alternative with EU-first hosting, MIT self-hosting, and flat workspace plans.",
    snapshotLead:
      "Featul is a Frill alternative for teams that want the same loop with EU hosting and open source. Frill still wins on a polished hosted UI.",
    pricing: "Flat monthly hosted",
    hosting: "Varies by plan",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Announcements",
      competitor: "Strong hosted announcement UX",
      featul: "Changelog in the same workspace as votes",
    },
    bestForThem: "Teams that want a modern hosted portal fast",
    bestForFeatul: "Teams that need EU hosting or self-hosting",
    stayIf:
      "Stay on Frill if the UI is already the brand and you do not need MIT-licensed self-hosting. Switch when GDPR, EU defaults, or workspace pricing are the ticket.",
    migrate:
      "Recreate boards and statuses, move posts, connect Slack, keep the public roadmap URL stable as you cut over.",
    unique:
      "Frill and Featul both sell boards plus roadmap plus changelog. The Featul difference is privacy-first EU hosting, open source, and $24 workspace Starter.",
  },
  sleekplan: {
    kind: "voting-board",
    metaTitle: "Sleekplan alternatives | EU product feedback",
    heroTitle: "Sleekplan alternatives",
    heroKicker: "Featul vs Sleekplan",
    description:
      "Sleekplan alternatives: Featul is an EU-hosted product feedback platform with voting, public roadmap, changelog, and open source self-hosting. Workspace plans from $24/month.",
    summary:
      "Sleekplan is an all-in-one feedback tool with a strong widget. Featul is a Sleekplan alternative with EU residency by default and a MIT-licensed codebase.",
    snapshotLead:
      "Featul is a Sleekplan alternative when EU hosting and a connected changelog matter as much as the embeddable widget.",
    pricing: "Startup-friendly hosted plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Widget",
      competitor: "Strong embeddable widget",
      featul: "In-app widget plus public board",
    },
    bestForThem: "Teams that bought Sleekplan for the widget",
    bestForFeatul: "Teams that want EU-first product feedback",
    stayIf:
      "Stay if the Sleekplan widget and surveys are working. Switch when you need EU defaults, open source, or a workspace price instead of stacking tools.",
    migrate:
      "Stand up a Featul board, embed the widget, import posts, map statuses, Slack-notify the team.",
    unique:
      "Sleekplan’s widget is the hook. Featul’s hook is the product feedback platform behind the widget: public roadmap, changelog, EU hosting.",
  },
  roadmunk: {
    kind: "product-management",
    metaTitle: "Roadmunk alternatives | Feedback + public roadmap",
    heroTitle: "Roadmunk alternatives",
    heroKicker: "Roadmap with a feedback board",
    description:
      "Roadmunk alternatives that include product feedback: Featul pairs a public roadmap with voting and a changelog, EU-hosted and open source.",
    summary:
      "Roadmunk is visual roadmap software. Featul is a Roadmunk alternative when you also need customers to vote and read a changelog.",
    snapshotLead:
      "Featul will not out-design Roadmunk timelines. It will attach votes and a changelog to a public roadmap under EU hosting.",
    pricing: "Roadmapping product pricing",
    hosting: "Commercial SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Visual timelines",
      competitor: "Presentation-ready roadmaps",
      featul: "Customer-facing columns tied to votes",
    },
    bestForThem: "PMs presenting timeline slides",
    bestForFeatul: "Teams collecting product feedback on the same roadmap",
    stayIf:
      "Stay on Roadmunk if executives buy the visual. Switch if customers never see it and you still need a public product feedback portal.",
    migrate:
      "Recreate public columns in Featul, import the requests, leave fancy timelines behind if they were internal-only.",
    unique:
      "A Roadmunk alternative for SaaS support teams is usually a public roadmap they can vote on. That is Featul, not another slide tool.",
  },
  beamer: {
    kind: "changelog",
    metaTitle: "Beamer alternatives | Changelog + product feedback",
    heroTitle: "Beamer alternatives",
    heroKicker: "Changelog with a feedback board",
    description:
      "Beamer alternatives that include product feedback: Featul is an EU-hosted changelog plus voting board and public roadmap, open source, workspace pricing from $24/month.",
    summary:
      "Beamer is a changelog and announcement tool. Featul is a Beamer alternative when you also need feature voting and a public roadmap.",
    snapshotLead:
      "Featul is a Beamer alternative for teams tired of a changelog tool plus a separate board. One EU-hosted workspace does both.",
    pricing: "Announcement-tool plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "In-app announcement widgets",
      competitor: "Beamer’s core strength",
      featul: "Changelog plus in-app widget for feedback",
    },
    bestForThem: "Teams that live in announcement popups",
    bestForFeatul: "Teams that need changelog and a voting board together",
    stayIf:
      "Stay on Beamer if in-app changelog widgets are the product. Switch when you also bought a Canny or Nolt board and want one tool.",
    migrate:
      "Bring past release notes into Featul’s changelog, create the board for new requests, link shipped items back to posts.",
    unique:
      "Beamer owns announcements. Featul owns the loop: request, public roadmap, changelog. Search “Beamer alternative” with “feedback” and that is the split.",
  },
  productlane: {
    kind: "linear",
    metaTitle: "Productlane alternatives | Feedback beyond Linear",
    heroTitle: "Productlane alternatives",
    heroKicker: "Customer portal, any tracker",
    description:
      "Productlane alternatives if you want a customer feedback portal that is not Linear-only: Featul is EU-hosted, open source, with public roadmap and changelog.",
    summary:
      "Productlane is built around Linear. Featul is a Productlane alternative for teams that want a public product feedback platform via API and webhooks.",
    snapshotLead:
      "Stay on Productlane if Linear is the OS. Featul is the Productlane alternative when the customer portal should outlive a single tracker.",
    pricing: "Linear-adjacent SaaS plans",
    hosting: "Hosted; check region",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Linear",
      competitor: "Deep native Linear workflow",
      featul: "API, webhooks, Slack. Tracker-agnostic",
    },
    bestForThem: "Product teams whose backlog is Linear",
    bestForFeatul: "Teams that want an EU-hosted customer portal",
    stayIf:
      "Stay if two-way Linear sync is why Productlane exists. Switch if security wants EU hosting or you might leave Linear.",
    migrate:
      "Export requests, recreate them in Featul, keep Linear as the engineering tracker, connect webhooks instead of a native two-way UI.",
    unique:
      "Productlane is excellent at Linear. Featul is a product feedback platform that does not assume Linear. That is the honest Productlane alternative.",
  },
  hellonext: {
    kind: "voting-board",
    metaTitle: "HelloNext alternatives | Boards, roadmap, changelog",
    heroTitle: "HelloNext alternatives",
    heroKicker: "Featul vs HelloNext",
    description:
      "HelloNext alternatives: Featul is an EU-hosted product feedback platform with voting, public roadmap, changelog, and open source self-hosting.",
    summary:
      "HelloNext offers feedback and roadmap boards. Featul is a HelloNext alternative with EU data residency by default and a MIT-licensed workspace.",
    snapshotLead:
      "Featul is a HelloNext alternative for the same portal job with EU hosting and workspace pricing.",
    pricing: "Hosted portal plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Public portal",
      competitor: "Good customization",
      featul: "Branding, custom domain, EU workspace",
    },
    bestForThem: "Teams happy on a hosted HelloNext portal",
    bestForFeatul: "Teams that need EU residency or self-host",
    stayIf:
      "Stay if the HelloNext portal is already branded and working. Switch for EU defaults, open source, or a changelog that is first-class.",
    migrate:
      "Recreate boards, import posts, map statuses, connect Slack, changelog the first ship.",
    unique:
      "HelloNext and Featul both sell the public board. Featul’s difference is EU hosting, open source, a public roadmap, a changelog, and a $24 workspace.",
  },
  feedbear: {
    kind: "voting-board",
    metaTitle: "FeedBear alternatives | Voting + changelog",
    heroTitle: "FeedBear alternatives",
    heroKicker: "Featul vs FeedBear",
    description:
      "FeedBear alternatives for growing SaaS: Featul adds a public roadmap and changelog to simple voting, with EU hosting and open source.",
    summary:
      "FeedBear is a simple voting board. Featul is a FeedBear alternative when you need roadmap, changelog, and EU hosting.",
    snapshotLead:
      "Featul is a FeedBear alternative for teams that started on a cheap board and now need a product feedback platform.",
    pricing: "Very affordable hosted voting",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Depth",
      competitor: "Simple voting",
      featul: "Voting, public roadmap, changelog",
    },
    bestForThem: "Early teams that only need votes",
    bestForFeatul: "Teams ready for a public roadmap",
    stayIf:
      "Stay on FeedBear if price and simplicity win. Switch when customers ask for a roadmap or you need EU hosting.",
    migrate:
      "Import ideas, keep titles customers typed, add roadmap columns, ship a changelog.",
    unique:
      "FeedBear is the on-ramp. Featul is the product feedback platform after the on-ramp: privacy-first, EU-hosted, open source.",
  },
  noora: {
    kind: "voting-board",
    metaTitle: "Noora alternatives | Feedback you still control",
    heroTitle: "Noora alternatives",
    heroKicker: "Human triage, EU hosting",
    description:
      "Noora alternatives if you want product feedback without AI as the product: Featul is EU-hosted, open source, with boards, public roadmap, and changelog.",
    summary:
      "Noora emphasizes AI feedback analysis. Featul is a Noora alternative for teams that want a customer-facing portal they control, with EU hosting.",
    snapshotLead:
      "Featul does not sell AI categorization as the headline. It sells a product feedback platform: votes, public roadmap, changelog, EU hosting.",
    pricing: "AI-feedback product plans",
    hosting: "Check current docs",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "AI categorization",
      competitor: "Core pitch",
      featul: "Team review plus grouping; you stay in control",
    },
    bestForThem: "Teams buying AI insights as the product",
    bestForFeatul: "Teams that want a public feedback portal",
    stayIf:
      "Stay on Noora if automatic insights are why you bought it. Switch if you need a public roadmap customers can see and EU hosting you can explain.",
    migrate:
      "Bring the human-readable requests into Featul, group duplicates, put the real themes on the public roadmap.",
    unique:
      "A Noora alternative for most SaaS PMs is still a board. Featul is that board plus changelog, without making AI the vendor lock.",
  },
  convas: {
    kind: "voting-board",
    metaTitle: "Convas alternatives | EU product feedback",
    heroTitle: "Convas alternatives",
    heroKicker: "Featul vs Convas",
    description:
      "Convas alternatives: Featul is a privacy-first product feedback platform with EU hosting, public roadmap, changelog, and MIT self-hosting.",
    summary:
      "Convas keeps customer feedback simple. Featul is a Convas alternative with a fuller loop and EU-first defaults.",
    snapshotLead:
      "Featul is a Convas alternative when simple capture needs a public roadmap and changelog behind it.",
    pricing: "Simple hosted plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Roadmap visualization",
      competitor: "Minimal",
      featul: "Public roadmap tied to votes",
    },
    bestForThem: "Teams that want the smallest UI",
    bestForFeatul: "Teams that want a complete product feedback platform",
    stayIf:
      "Stay on Convas if minimal is the brand. Switch when you need EU hosting or a changelog.",
    migrate:
      "Copy posts, tags, and statuses into Featul, embed the widget, announce the new URL in a changelog.",
    unique:
      "Convas is simple on purpose. Featul stays simple on the surface and adds public roadmap, changelog, open source, and EU hosting underneath.",
  },
  userback: {
    kind: "visual-feedback",
    metaTitle: "Userback alternatives | Boards vs visual bugs",
    heroTitle: "Userback alternatives",
    heroKicker: "Portal, not just screenshots",
    description:
      "Userback alternatives for feature voting: Featul is an EU-hosted product feedback platform with a public roadmap and changelog. Keep Userback if visual bug markup is the job.",
    summary:
      "Userback excels at visual bug reporting. Featul is a Userback alternative for a public product feedback portal, not annotated screenshots.",
    snapshotLead:
      "Do not replace Userback’s screenshot workflow with Featul. Do replace a missing public roadmap and changelog with Featul.",
    pricing: "Visual-feedback product plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Screen recording / markup",
      competitor: "Core product",
      featul: "Not the product; voting portal instead",
    },
    bestForThem: "QA and visual bug capture",
    bestForFeatul: "Customer feature voting and public roadmap",
    stayIf:
      "Stay on Userback for annotated bugs. Add Featul when you also need a public product feedback board.",
    migrate:
      "Move feature-request threads to Featul. Leave pixel bugs in Userback or your tracker.",
    unique:
      "Userback and Featul solve different intakes. The honest Userback alternative for “feature voting” is Featul. The honest alternative for “screenshot this button” is still Userback.",
  },
  rapidr: {
    kind: "voting-board",
    metaTitle: "Rapidr alternatives | Changelog + EU feedback",
    heroTitle: "Rapidr alternatives",
    heroKicker: "Featul vs Rapidr",
    description:
      "Rapidr alternatives: Featul is an EU-hosted product feedback platform with voting, public roadmap, changelog, and workspace pricing. Open source optional.",
    summary:
      "Rapidr manages customer feedback with AI categorization. Featul is a Rapidr alternative focused on the public loop and EU hosting.",
    snapshotLead:
      "Featul is a Rapidr alternative when branding, EU residency, and a changelog matter more than AI labels.",
    pricing: "Feedback-management plans",
    hosting: "Residency available; check plan",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Intercom-style routing",
      competitor: "Strong support-tool adjacency",
      featul: "Slack, webhooks, API",
    },
    bestForThem: "Teams routing feedback next to Intercom",
    bestForFeatul: "Teams that want a public product feedback portal",
    stayIf:
      "Stay if Intercom-adjacent AI routing is the workflow. Switch for a customer-facing roadmap and MIT self-host.",
    migrate:
      "Import requests, map tags, connect Slack, publish the public roadmap.",
    unique:
      "Rapidr sits near support. Featul sits near product. A Rapidr alternative for “public roadmap” is Featul.",
  },
  suggestkit: {
    kind: "voting-board",
    metaTitle: "SuggestKit alternatives | Slack + changelog",
    heroTitle: "SuggestKit alternatives",
    heroKicker: "Featul vs SuggestKit",
    description:
      "SuggestKit alternatives with Slack and a changelog: Featul is an EU-hosted, open source product feedback platform. Boards, public roadmap, changelog, $24/month Starter.",
    summary:
      "SuggestKit is a fast feedback board. Featul is a SuggestKit alternative with a fuller changelog, EU hosting, and Discord as well as Slack.",
    snapshotLead:
      "Featul is a SuggestKit alternative for teams that started on a cheap board and now need EU hosting and a real changelog.",
    pricing: "Affordable starter hosted",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Chat alerts",
      competitor: "Setup-dependent",
      featul: "Slack and Discord included on paid plans",
    },
    bestForThem: "Teams that want the fastest cheap board",
    bestForFeatul: "Teams that want EU-hosted product feedback",
    stayIf:
      "Stay on SuggestKit if it is already enough. Switch when you need a public roadmap customers trust or EU defaults.",
    migrate:
      "Move posts, keep titles, connect Slack and Discord, changelog the first ship.",
    unique:
      "SuggestKit wins on time-to-board. Featul wins when you also want a public roadmap, a changelog, EU hosting, and open source.",
  },
  savio: {
    kind: "b2b-feedback",
    metaTitle: "Savio alternatives | Public B2B feedback portal",
    heroTitle: "Savio alternatives",
    heroKicker: "Portal vs CRM-weighted requests",
    description:
      "Savio alternatives for a public product feedback portal: Featul is EU-hosted and open source, with voting, public roadmap, and changelog. Keep Savio for CRM revenue weighting.",
    summary:
      "Savio tracks B2B feature requests next to CRM data. Featul is a Savio alternative for the public portal, not for Salesforce-weighted scoring.",
    snapshotLead:
      "Featul does not replace Savio’s revenue-weighted inbox. It replaces the missing public roadmap and changelog with EU hosting.",
    pricing: "B2B request-tracking plans",
    hosting: "Commercial SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "CRM / revenue weighting",
      competitor: "Core pitch",
      featul: "Public votes; tag accounts if you need context",
    },
    bestForThem: "B2B teams scoring requests by ARR",
    bestForFeatul: "Teams that need a customer-facing feedback portal",
    stayIf:
      "Stay on Savio if CSMs live in CRM-weighted queues. Switch the public face to Featul if customers never see Savio.",
    migrate:
      "Publish the customer-safe requests on Featul. Keep ARR notes internal. Changelog when those requests ship.",
    unique:
      "Savio is for sales-aware prioritization. Featul is a product feedback platform customers can open. Most “Savio alternative” traffic from startups wants the second thing.",
  },
  productroad: {
    kind: "voting-board",
    metaTitle: "ProductRoad alternatives | Public roadmap + feedback",
    heroTitle: "ProductRoad alternatives",
    heroKicker: "Roadmap with a voting board",
    description:
      "ProductRoad alternatives: Featul unifies product feedback, a public roadmap, and a changelog in an EU-hosted, open source workspace.",
    summary:
      "ProductRoad is public roadmap software. Featul is a ProductRoad alternative that also collects votes and publishes a changelog.",
    snapshotLead:
      "Featul is a ProductRoad alternative when the roadmap should be backed by a real feedback board, not only a status page.",
    pricing: "Affordable public-roadmap plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Feedback collection",
      competitor: "Roadmap-first",
      featul: "Votes drive the public roadmap",
    },
    bestForThem: "Teams that only needed a public status roadmap",
    bestForFeatul: "Teams that need votes plus a changelog",
    stayIf:
      "Stay if ProductRoad is only a pretty public timeline. Switch when users need to submit and vote.",
    migrate:
      "Recreate columns in Featul, add the board, import requests, changelog the next release.",
    unique:
      "A public roadmap without a board is a poster. Featul is the ProductRoad alternative that makes the poster a product feedback platform.",
  },
  featureupvote: {
    kind: "voting-board",
    metaTitle: "Feature Upvote alternatives | EU voting + changelog",
    heroTitle: "Feature Upvote alternatives",
    heroKicker: "Featul vs Feature Upvote",
    description:
      "Feature Upvote alternatives: Featul is an EU-hosted product feedback platform with a public roadmap, changelog, and MIT-licensed self-hosting.",
    summary:
      "Feature Upvote is a simple voting board. Featul is a Feature Upvote alternative with roadmap, changelog, and EU hosting.",
    snapshotLead:
      "Featul is a Feature Upvote alternative for teams that liked simple voting and then needed a product feedback platform.",
    pricing: "Simple hosted voting",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Roadmap visualization",
      competitor: "Limited",
      featul: "Full public roadmap plus changelog",
    },
    bestForThem: "Teams that want voting and nothing else",
    bestForFeatul: "Teams that want the Featul loop",
    stayIf:
      "Stay on Feature Upvote if the board is done. Switch for EU hosting, open source, or a changelog.",
    migrate:
      "Import ideas, map statuses, share the Featul URL, embed the widget.",
    unique:
      "Feature Upvote is named after the mechanic. Featul is named after shipping. The alternative is the rest of the product feedback platform.",
  },
  supahub: {
    kind: "voting-board",
    metaTitle: "Supahub alternatives | Modern EU feedback portal",
    heroTitle: "Supahub alternatives",
    heroKicker: "Featul vs Supahub",
    description:
      "Supahub alternatives: Featul is an EU-hosted, open source product feedback platform with Slack, Discord, public roadmap, and changelog. Workspace from $24/month.",
    summary:
      "Supahub is a modern feedback portal. Featul is a Supahub alternative with MIT self-hosting and EU defaults.",
    snapshotLead:
      "Featul and Supahub both look like modern portals. Featul’s split is EU hosting, open source, and workspace pricing.",
    pricing: "Affordable startup hosted",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Chat integrations",
      competitor: "Modern portal UX",
      featul: "Slack and Discord on paid plans",
    },
    bestForThem: "Startups that want a sleek hosted UI",
    bestForFeatul: "Startups that need EU hosting or source access",
    stayIf:
      "Stay on Supahub if the UI is the reason you bought it and region does not matter. Switch for GDPR, MIT, or self-host.",
    migrate:
      "Move boards and posts, connect Slack and Discord, keep the public roadmap public.",
    unique:
      "Supahub is a strong hosted look. Featul is the product feedback platform you can audit: open source, EU-hosted, changelog included.",
  },
  headwayapp: {
    kind: "changelog",
    metaTitle: "Headway alternatives | Changelog + feedback board",
    heroTitle: "Headway alternatives",
    heroKicker: "Updates plus a voting board",
    description:
      "Headway alternatives that include product feedback: Featul pairs a changelog with voting and a public roadmap. EU-hosted, open source, $24/month Starter.",
    summary:
      "Headway is a changelog widget. Featul is a Headway alternative when you also need a product feedback board.",
    snapshotLead:
      "Keep Headway if popup changelogs are the brand. Featul is the Headway alternative for feedback plus release notes in one workspace.",
    pricing: "Changelog-widget plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Announcement popups",
      competitor: "Headway’s look",
      featul: "Changelog plus feedback widget",
    },
    bestForThem: "Teams that only ship announcement widgets",
    bestForFeatul: "Teams that collect votes and ship notes",
    stayIf:
      "Stay on Headway for beautiful update popups. Switch when you also run a Canny-style board.",
    migrate:
      "Bring release notes into Featul, open a board for new requests, link shipped posts.",
    unique:
      "Headway is a changelog. Featul is a product feedback platform that includes a changelog. That is the Headway alternative most SaaS teams mean.",
  },
  announcekit: {
    kind: "changelog",
    metaTitle: "AnnounceKit alternatives | Release notes + feedback",
    heroTitle: "AnnounceKit alternatives",
    heroKicker: "Changelog with a public roadmap",
    description:
      "AnnounceKit alternatives: Featul is an EU-hosted changelog plus product feedback board and public roadmap. Open source, workspace pricing.",
    summary:
      "AnnounceKit is for release notes and widgets. Featul is an AnnounceKit alternative when feedback and roadmap belong next to those notes.",
    snapshotLead:
      "Featul is an AnnounceKit alternative for one workspace instead of notes in one tool and votes in another.",
    pricing: "Release-notes product plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Notification widgets",
      competitor: "Core strength",
      featul: "Changelog in the product loop",
    },
    bestForThem: "Teams invested in announcement widgets",
    bestForFeatul: "Teams unifying notes with product feedback",
    stayIf:
      "Stay if AnnounceKit widgets are already in production everywhere. Switch when a second board vendor appears on the invoice.",
    migrate:
      "Import or recreate recent notes, open Featul boards, Slack the team on new posts.",
    unique:
      "AnnounceKit announces. Featul also collects. The AnnounceKit alternative with “product feedback” in the query is Featul.",
  },
  launchnotes: {
    kind: "changelog",
    metaTitle: "LaunchNotes alternatives | Simpler release + feedback",
    heroTitle: "LaunchNotes alternatives",
    heroKicker: "Release notes without enterprise",
    description:
      "LaunchNotes alternatives for smaller SaaS teams: Featul is an EU-hosted product feedback platform with a changelog, public roadmap, and voting. Open source.",
    summary:
      "LaunchNotes is a release-management platform. Featul is a LaunchNotes alternative if you needed notes plus a feedback board, not an enterprise launch suite.",
    snapshotLead:
      "Featul will not replace LaunchNotes enterprise launch ops. It will replace a changelog-plus-board stack at $24/month.",
    pricing: "Release-management / enterprise features",
    hosting: "Commercial SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Launch ops",
      competitor: "Advanced release management",
      featul: "Changelog tied to voted requests",
    },
    bestForThem: "Orgs running formal launch programs",
    bestForFeatul: "Product teams closing the feedback loop",
    stayIf:
      "Stay on LaunchNotes if launch checklists are the product. Switch if you only needed a public changelog and a place to vote.",
    migrate:
      "Move customer-facing notes to Featul, attach them to roadmap items, keep internal launch docs where they are.",
    unique:
      "LaunchNotes is ops. Featul is a product feedback platform. A ten-person SaaS looking at LaunchNotes alternatives usually wants Featul’s job.",
  },
  fider: {
    kind: "open-source",
    metaTitle: "Fider alternatives | Open source + hosted EU",
    heroTitle: "Fider alternatives",
    heroKicker: "Open source with a full loop",
    description:
      "Fider alternatives: Featul is also open source, plus a hosted EU product feedback platform with public roadmap and changelog. MIT License, workspace plans from $24/month.",
    summary:
      "Fider is open-source feature voting. Featul is a Fider alternative when you want OSS plus roadmap, changelog, and a supported EU workspace.",
    snapshotLead:
      "Both can be self-hosted. Featul is the Fider alternative that also ships a public roadmap, changelog, and hosted EU option.",
    pricing: "Free self-host; ops is the cost",
    hosting: "Self-host wherever you run it",
    openSource: "Yes",
    selfHost: "Yes",
    extra: {
      label: "Hosted EU workspace",
      competitor: "You run the servers",
      featul: "Hosted EU or self-host",
    },
    bestForThem: "Teams happy running a minimal OSS voting app",
    bestForFeatul: "Teams that want OSS plus a full product feedback platform",
    stayIf:
      "Stay on Fider if a lean self-hosted board is exactly the spec. Switch when you want changelog, public roadmap, and someone else to host in the EU.",
    migrate:
      "Export Fider posts, import into Featul, keep slugs readable, optionally keep self-hosting Featul if that was the point of Fider.",
    unique:
      "Fider is the honest open-source voting app. Featul is the honest open-source product feedback platform: still MIT, still self-hostable, also a changelog and a public roadmap.",
  },
  airfocus: {
    kind: "product-management",
    metaTitle: "Airfocus alternatives | Simpler public feedback",
    heroTitle: "Airfocus alternatives",
    heroKicker: "Portal, not a modular PM suite",
    description:
      "Airfocus alternatives for a customer portal: Featul is an EU-hosted product feedback platform with voting, public roadmap, and changelog. Open source, $24/month Starter.",
    summary:
      "Airfocus is a modular product management platform. Featul is an Airfocus alternative only for the public feedback and roadmap slice.",
    snapshotLead:
      "Featul does not replace Airfocus modules. It replaces a customer-facing board with EU hosting and a changelog.",
    pricing: "Modular PM platform pricing",
    hosting: "Commercial SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Prioritization modules",
      competitor: "Flexible scoring systems",
      featul: "Votes plus team review",
    },
    bestForThem: "PMs building internal scoring systems",
    bestForFeatul: "Teams sharing a public product feedback portal",
    stayIf:
      "Stay on Airfocus if modules and scoring are how you plan. Switch if customers only needed a board.",
    migrate:
      "Take the public items out of Airfocus, put them on Featul, leave internal scores behind.",
    unique:
      "Airfocus is a workshop. Featul is a storefront. An Airfocus alternative for “public roadmap” is the storefront.",
  },
  changelogfy: {
    kind: "changelog",
    metaTitle: "Changelogfy alternatives | Feedback + release notes",
    heroTitle: "Changelogfy alternatives",
    heroKicker: "Widget plus a voting board",
    description:
      "Changelogfy alternatives: Featul unifies changelog widgets with a product feedback board and public roadmap. EU-hosted, open source, Slack and Discord.",
    summary:
      "Changelogfy is changelog and feedback widgets. Featul is a Changelogfy alternative with a full EU-hosted workspace behind the widget.",
    snapshotLead:
      "Featul is a Changelogfy alternative when the widget needs a real board, public roadmap, and MIT self-host behind it.",
    pricing: "Widget-centric hosted plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Embeddable widgets",
      competitor: "Customizable embeds",
      featul: "Widget plus hosted portal and changelog",
    },
    bestForThem: "Teams embedding a small changelog",
    bestForFeatul: "Teams wanting the full product feedback platform",
    stayIf:
      "Stay if a small embed is enough. Switch when you need voting and a public roadmap.",
    migrate:
      "Point the widget at Featul, import notes, open the board.",
    unique:
      "Changelogfy embeds. Featul is the product feedback platform the embed talks to: EU hosting, public roadmap, changelog, open source.",
  },
  noticeable: {
    kind: "changelog",
    metaTitle: "Noticeable alternatives | Newspage + feedback board",
    heroTitle: "Noticeable alternatives",
    heroKicker: "Updates plus product feedback",
    description:
      "Noticeable alternatives: Featul adds a product feedback board and public roadmap to release updates. EU-hosted, open source, workspace pricing.",
    summary:
      "Noticeable is a newspage and changelog. Featul is a Noticeable alternative when readers should also vote on what ships next.",
    snapshotLead:
      "Featul is a Noticeable alternative for teams that want a newspage and a voting board without two vendors.",
    pricing: "Newspage / changelog plans",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Segment notifications",
      competitor: "Audience-specific updates",
      featul: "Changelog plus public board for everyone",
    },
    bestForThem: "Teams investing in designed newspages",
    bestForFeatul: "Teams connecting updates to voted requests",
    stayIf:
      "Stay on Noticeable for segmented newspage design. Switch when you also need product feedback.",
    migrate:
      "Bring the latest notes into Featul, open boards, keep design-heavy pages only if they still earn their keep.",
    unique:
      "Noticeable is a newspage. Featul is a product feedback platform that still publishes what changed. That is the Noticeable alternative with “roadmap” in the query.",
  },
  productlift: {
    kind: "voting-board",
    metaTitle: "ProductLift alternatives | Dev-friendly EU feedback",
    heroTitle: "ProductLift alternatives",
    heroKicker: "Featul vs ProductLift",
    description:
      "ProductLift alternatives: Featul is an EU-hosted, open source product feedback platform with API, public roadmap, changelog, and custom branding.",
    summary:
      "ProductLift is feedback for growing products, with a developer tilt. Featul is a ProductLift alternative with EU defaults and MIT self-hosting.",
    snapshotLead:
      "Featul is a ProductLift alternative when you want the same portal with EU hosting and an inspectable codebase.",
    pricing: "Hosted plans for growing products",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "API",
      competitor: "Good API access",
      featul: "API, webhooks, Slack, Discord",
    },
    bestForThem: "Dev-led teams on a hosted portal",
    bestForFeatul: "Dev-led teams that want EU hosting or self-host",
    stayIf:
      "Stay if ProductLift’s API and UI are enough. Switch for MIT, EU, or a first-class changelog.",
    migrate:
      "Use exports or API dump, recreate in Featul, reconnect automations to webhooks.",
    unique:
      "ProductLift speaks developer. Featul does too, and publishes the source. That is the ProductLift alternative for teams who ask for open source on the security form.",
  },
  releasenotes: {
    kind: "changelog",
    metaTitle: "ReleaseNotes.io alternatives | Notes + voting board",
    heroTitle: "ReleaseNotes alternatives",
    heroKicker: "Changelog with product feedback",
    description:
      "ReleaseNotes.io alternatives: Featul is an EU-hosted changelog plus product feedback board and public roadmap. Open source, from $24/month.",
    summary:
      "ReleaseNotes.io publishes release notes. Featul is a ReleaseNotes alternative when you also need customers to vote.",
    snapshotLead:
      "Featul is a ReleaseNotes.io alternative for the combined job: announce what shipped and collect what is next.",
    pricing: "Affordable changelog hosting",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Focus",
      competitor: "Changelog-only",
      featul: "Changelog plus boards and public roadmap",
    },
    bestForThem: "Teams that only publish notes",
    bestForFeatul: "Teams that also collect product feedback",
    stayIf:
      "Stay if a cheap changelog is the whole need. Switch when a board appears in the same budget.",
    migrate:
      "Copy recent notes into Featul, open the board, link the next note to voted items.",
    unique:
      "ReleaseNotes.io is a publisher. Featul is a product feedback platform that also publishes. If you also need a roadmap, that is Featul.",
  },
  usersnap: {
    kind: "visual-feedback",
    metaTitle: "Usersnap alternatives | Portal vs visual bugs",
    heroTitle: "Usersnap alternatives",
    heroKicker: "Voting board, not screenshots",
    description:
      "Usersnap alternatives for feature voting: Featul is an EU-hosted product feedback platform with public roadmap and changelog. Keep Usersnap for visual bug capture.",
    summary:
      "Usersnap is visual feedback and bug tracking. Featul is a Usersnap alternative for a public product feedback portal, not in-app screenshots.",
    snapshotLead:
      "Featul does not replace Usersnap screenshots. It replaces the missing public roadmap and changelog with EU hosting and open source.",
    pricing: "Visual feedback / session tools",
    hosting: "Hosted SaaS",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "In-app screenshots",
      competitor: "Core product",
      featul: "Not the product",
    },
    bestForThem: "Visual bug and UX capture",
    bestForFeatul: "Public feature voting and roadmap",
    stayIf:
      "Stay on Usersnap for annotated bugs. Use Featul when you need a customer-facing product feedback platform.",
    migrate:
      "Move feature requests to Featul. Leave screenshot bugs in Usersnap or Jira.",
    unique:
      "Usersnap captures pixels. Featul captures demand. A Usersnap alternative for “public roadmap” is Featul, not another screenshot tool.",
  },
}

export const KIND_RELATED_LINKS: Record<
  CompetitorKind,
  { href: string; label: string }
> = {
  "voting-board": {
    href: "/use-cases/feature-voting-board",
    label: "Feature voting board",
  },
  "feedback-suite": {
    href: "/use-cases/customer-feedback-portal",
    label: "Customer feedback portal",
  },
  changelog: {
    href: "/use-cases/public-changelog",
    label: "Public changelog",
  },
  "product-management": {
    href: "/use-cases/saas-product-feedback",
    label: "SaaS product feedback",
  },
  "visual-feedback": {
    href: "/use-cases/customer-feedback-portal",
    label: "Customer feedback portal",
  },
  "open-source": {
    href: "/use-cases/open-source-roadmap",
    label: "Open source roadmap",
  },
  "b2b-feedback": {
    href: "/use-cases/b2b-customer-feedback",
    label: "B2B customer feedback",
  },
  linear: {
    href: "/use-cases/product-team-collaboration",
    label: "Product team collaboration",
  },
}

function fallbackDetail(name: string): CompetitorDetail {
  return {
    kind: "voting-board",
    metaTitle: `${name} alternatives | Product feedback + roadmap`,
    heroTitle: `${name} alternatives`,
    heroKicker: `Featul vs ${name}`,
    description: `${name} alternatives: Featul is an EU-hosted, open source product feedback platform with feature voting, a public roadmap, and a changelog. Workspace plans from $24/month.`,
    summary: `${name} collects product feedback. Featul is a ${name} alternative with a public roadmap, changelog, EU hosting, and MIT-licensed self-hosting.`,
    snapshotLead: `Featul is a ${name} alternative when you want the full product feedback loop: votes, public roadmap, and changelog, with EU hosting and workspace pricing.`,
    pricing: "Hosted SaaS; check live pricing",
    hosting: "Check current docs",
    openSource: "No",
    selfHost: "No",
    extra: {
      label: "Product feedback loop",
      competitor: "Varies by plan",
      featul: "Boards, public roadmap, and changelog",
    },
    bestForThem: `Teams already standardized on ${name}`,
    bestForFeatul: "SaaS teams that want an EU-hosted product feedback platform",
    stayIf: `Stay on ${name} if its unique workflow is already load-bearing. Switch when you need EU hosting, open source, or a connected changelog.`,
    migrate: `Export posts from ${name}, recreate tags and statuses in Featul, share the new board URL, and changelog the first shipped item.`,
    unique: `Most “${name} alternative” searches want a product feedback platform, not a clone. Featul answers with feature voting, a public roadmap, a changelog, EU hosting, and workspace pricing.`,
  }
}

export function getCompetitorDetail(slug: string): CompetitorDetail | undefined {
  return COMPETITOR_DETAILS[slug]
}

export function applyCompetitorDetail(alt: Alternative): Alternative {
  if (alt.snapshot?.length && alt.guide?.length) {
    return alt
  }

  const detail = COMPETITOR_DETAILS[alt.slug] ?? fallbackDetail(alt.name)

  return {
    ...alt,
    metaTitle: alt.metaTitle ?? detail.metaTitle,
    heroTitle: alt.heroTitle ?? detail.heroTitle,
    heroKicker: alt.heroKicker ?? detail.heroKicker,
    summary: detail.summary,
    snapshotLead: alt.snapshotLead ?? detail.snapshotLead,
    snapshot: alt.snapshot ?? snapshot(alt.name, detail),
    guide: alt.guide ?? guide(alt.name, detail),
  }
}

export function getDetailDescription(slug: string): string | undefined {
  return COMPETITOR_DETAILS[slug]?.description
}

export function getDetailFaqs(slug: string, name: string) {
  const detail = COMPETITOR_DETAILS[slug] ?? fallbackDetail(name)
  if (slug === "featurebase" || slug === "canny") return null
  return faqs(name, slug, detail)
}

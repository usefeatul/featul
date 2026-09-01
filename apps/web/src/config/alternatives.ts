export type FeatureSupport = boolean | 'partial'

export interface ComparisonFeature {
  key: string
  label: string
  description?: string
  Featul: FeatureSupport
  competitor: FeatureSupport
}

export interface Alternative {
  slug: string
  name: string
  website?: string
  tagline?: string
  summary?: string
  description?: string
  tags?: string[]
  pros?: string[]
  cons?: string[]
  victoryPoints?: string[]
  tradeoffs?: string[]
  image?: string
  /** Optional SERP title used as-is on comparison pages. */
  metaTitle?: string
  heroTitle?: string
  heroKicker?: string
  /** Unique long-form sections for high-intent comparison pages. */
  guide?: { title: string; answer?: string; body: string }[]
  /** Extractable at-a-glance rows for AI Overviews and comparison queries. */
  snapshot?: { label: string; competitor: string; featul: string }[]
  snapshotLead?: string
  features: ComparisonFeature[]
}

/** Displayed on comparison pages for freshness signals. */
export const ALTERNATIVES_UPDATED_LABEL = 'September 2026'
export const ALTERNATIVES_UPDATED_ISO = '2026-09-01'

// Base features we commonly compare across tools
const baseFeatures: Omit<ComparisonFeature, 'competitor'>[] = [
  { key: 'eu_hosting', label: 'EU Hosting', description: 'Default EU data hosting and residency options. Keeps user data regional by default for compliance and performance.', Featul: true },
  { key: 'gdpr', label: 'GDPR Compliance', description: 'Built-in consent and data controls aligned with GDPR. Reduce legal overhead with sensible defaults and auditability.', Featul: true },
  { key: 'feedback_boards', label: 'Feedback Boards', description: 'Collect and organize user feedback in dedicated boards. Prioritize themes and requests with tags and status.', Featul: true },
  { key: 'feature_voting', label: 'Feature Voting', description: 'Let users upvote ideas to surface priorities. Balance qualitative comments with quantitative signals.', Featul: true },
  { key: 'public_roadmap', label: 'Public Roadmap', description: 'Share progress publicly with transparent planning. Keep stakeholders aligned with statuses and timelines.', Featul: true },
  { key: 'changelog', label: 'Changelog', description: 'Publish releases and updates with clean release notes. Auto-link roadmap items to close the loop.', Featul: true },
  { key: 'embeddable_widget', label: 'Embeddable Widget', description: 'Embed feedback capture directly in your app. Gather context without forcing users to switch surfaces.', Featul: true },
  { key: 'api', label: 'API Access', description: 'Integrate via API to automate and customize workflows. Sync issues, tags, and statuses with your tools.', Featul: true },
  { key: 'sso', label: 'SSO', description: 'Single sign-on support for secure, centralized authentication. Works with common identity providers.', Featul: 'partial' },
  { key: 'slack', label: 'Slack Integration', description: 'Receive notifications and triage feedback in Slack. Respond quickly and keep the team in the loop.', Featul: true },
]

function withCompetitor(
  competitorDefaults: Record<string, FeatureSupport>
): ComparisonFeature[] {
  return baseFeatures.map((f) => ({
    ...f,
    competitor: competitorDefaults[f.key] ?? 'partial',
  }))
}

export const alternatives: Alternative[] = [
  {
    slug: 'userjot',
    name: 'UserJot',
    website: 'https://userjot.com',
    summary:
      'UserJot focuses on lightweight feedback collection. Featul offers end‑to‑end feedback, roadmap, and changelog in one.',
    tags: ['feedback', 'roadmap', 'voting'],
    image: '/image/image.jpeg',
    pros: ['Simple feedback capture', 'Clean UI'],
    cons: ['Limited roadmap tooling', 'Fewer integrations'],
    features: withCompetitor({
      eu_hosting: 'partial',
      gdpr: 'partial',
      feedback_boards: true,
      feature_voting: true,
      public_roadmap: 'partial',
      changelog: 'partial',
      embeddable_widget: true,
      api: 'partial',
      sso: false,
      slack: 'partial',
    }),
  },
  {
    slug: 'featurebase',
    name: 'Featurebase',
    website: 'https://featurebase.app',
    metaTitle: 'Featurebase alternatives | Open source vs Featurebase',
    heroTitle: 'Featurebase alternatives',
    heroKicker: 'Open source vs Featurebase',
    summary:
      'Featurebase is a hosted feedback suite with voting, roadmap, and changelog. Featul is an open source Featurebase alternative: MIT-licensed, self-hostable, EU-hosted, and priced per workspace instead of per seat.',
    tags: ['feedback', 'voting', 'open-source'],
    image: '/image/image.jpeg',
    pros: ['Help center plus AI support suite', 'Large integration catalog'],
    cons: ['Per-seat pricing as the team grows', 'Hosted-only, not self-hostable'],
    snapshotLead:
      'Featul is an open source Featurebase alternative. Both tools do boards, votes, a public roadmap, and a changelog. The split is pricing, self-hosting, EU defaults, and whether you also need Featurebase’s help-center suite.',
    snapshot: [
      {
        label: 'Pricing model',
        competitor: 'Per seat as more teammates join',
        featul: 'Flat workspace; Starter $24/month, Professional $47/month',
      },
      {
        label: 'Open source',
        competitor: 'No, hosted commercial SaaS',
        featul: 'Yes, MIT License',
      },
      {
        label: 'Self-hosting',
        competitor: 'No',
        featul: 'Yes, or a hosted EU workspace',
      },
      {
        label: 'Default hosting',
        competitor: 'Hosted SaaS; check current data-residency docs',
        featul: 'EU by default',
      },
      {
        label: 'Feedback boards and voting',
        competitor: 'Yes',
        featul: 'Yes',
      },
      {
        label: 'Public roadmap',
        competitor: 'Yes',
        featul: 'Yes',
      },
      {
        label: 'Changelog',
        competitor: 'Yes',
        featul: 'Yes',
      },
      {
        label: 'Help center and AI support suite',
        competitor: 'Mature product surface',
        featul: 'Not the product; feedback-to-release loop only',
      },
      {
        label: 'Best for',
        competitor: 'Teams that want feedback plus a customer help center',
        featul: 'Teams that want an inspectable, workspace-priced Featurebase alternative',
      },
    ],
    guide: [
      {
        title: 'Is Featul a good Featurebase alternative?',
        answer:
          'Yes, if you want the Featurebase loop—boards, votes, a public roadmap, and a changelog—without per-seat pricing or a closed vendor. Featul is MIT-licensed, self-hostable, EU-hosted by default, and billed per workspace. Stay on Featurebase if the help-center and AI support suite are already load-bearing.',
        body: 'Most searches for Featurebase alternatives are not “any voting board.” Teams want that same customer-facing loop with a different bill, a different host, or the option to keep the data if the vendor relationship ends. Featul is built for that job. It is a weaker Featurebase alternative if you expected a drop-in help center.',
      },
      {
        title: 'How much does a Featurebase alternative cost for a five-person team?',
        answer:
          'Featul Starter is $24 per month for the workspace, with a five-member cap on that plan. Professional is $47 per month. Featurebase scales primarily on seats, so a PM, CSM, and two engineers can multiply the invoice. Compare live pricing pages before you treat either number as a quote.',
        body: 'The decision is the pattern, not a screenshot of today’s list price. If five people need access, per-seat tools get expensive faster than a workspace cap. If one person will run the portal forever, seat cost may not be the reason to switch.',
      },
      {
        title: 'Is Featul an open source Featurebase alternative I can self-host?',
        answer:
          'Yes. Featul is MIT-licensed and can run on your infrastructure or as a hosted EU workspace. Featurebase is a strong hosted product; it is not a self-hosted MIT codebase. That difference shows up in procurement and “can we leave later?” conversations, not in whether voting works.',
        body: 'An open source Featurebase alternative matters when feedback is customer data you may need to move, show to security reviewers, or keep if you stop paying a vendor. Both products collect requests. Only one lets you keep the board when the contract ends.',
      },
      {
        title: 'Does Featul replace a changelog tool as well as Featurebase?',
        answer:
          'Yes for the feedback-to-release loop. Featul includes a public or private roadmap and a changelog in the same workspace as the voting board, so you do not buy a second announcement product for shipping notes. It does not replace Featurebase’s broader help-center suite.',
        body: 'Point the public URL or widget at Featul, keep columns such as Planned, In Progress, and Shipped, and publish a changelog when the first migrated item ships. That close-the-loop moment is what customers notice—not the vendor logo.',
      },
      {
        title: 'How do I migrate from Featurebase to Featul?',
        answer:
          'Export or import posts, then recreate categories, tags, and statuses so voters still recognize the board. Map duplicates before you go live so vote counts stay honest. Share the new URL, keep voting open, and changelog the first shipped item from the old list.',
        body: 'Customers care that their post still exists and that something shipped. They do not care which vendor rendered the upvote. For messy Featurebase workspaces, spend the extra hour on duplicate mapping; that is the migration step people skip and then regret.',
      },
      {
        title: 'Who should stay on Featurebase?',
        answer:
          'Stay if you already live in Featurebase’s help-center and AI support suite and do not need self-hosting or EU-first defaults. Switch when seat cost, data residency, or “we also bought a changelog tool” is the pain. Switching only because a new brand exists is a bad trade.',
        body: 'Featul is not trying to out-catalog Featurebase. It is trying to be the simpler open source Featurebase alternative: one workflow from vote to release note, at a predictable workspace rate, with the option to host it yourself.',
      },
    ],
    features: withCompetitor({
      eu_hosting: 'partial',
      gdpr: 'partial',
      feedback_boards: true,
      feature_voting: true,
      public_roadmap: true,
      changelog: true,
      embeddable_widget: true,
      api: true,
      sso: 'partial',
      slack: true,
    }),
  },
  {
    slug: 'nolt',
    name: 'Nolt',
    website: 'https://nolt.io',
    summary:
      'Nolt provides boards and voting. Featul adds changelog and privacy‑first EU hosting by default.',
    tags: ['feedback', 'boards'],
    image: '/image/image.jpeg',
    pros: ['Popular boards', 'Good UX'],
    cons: ['Less granular privacy options'],
    features: withCompetitor({
      eu_hosting: 'partial',
      gdpr: 'partial',
      feedback_boards: true,
      feature_voting: true,
      public_roadmap: true,
      changelog: 'partial',
      embeddable_widget: true,
      api: 'partial',
      sso: 'partial',
      slack: true,
    }),
  },
  {
    slug: 'canny',
    name: 'Canny',
    website: 'https://canny.io',
    metaTitle: 'Canny alternatives & integrations | Featul vs Canny',
    heroTitle: 'Canny alternatives',
    heroKicker: 'Featul vs Canny integrations',
    summary:
      'Canny is known for feature request tracking and a large integration catalog. Featul is a Canny alternative with EU hosting, Canny import, Slack/webhooks/API, and a simpler boards-to-changelog workflow.',
    tags: ['feedback', 'roadmap', 'voting', 'integrations'],
    image: '/image/image.jpeg',
    pros: ['Broad third-party integrations', 'Long enterprise track record'],
    cons: ['US-centric hosting', 'Seat-based pricing as teams grow'],
    snapshotLead:
      'Featul is a Canny alternative with Canny import. Both cover boards, votes, roadmap, and changelog. Canny still wins on native third-party apps. Featul wins on EU hosting, workspace pricing, and a shorter integration list that covers Slack, webhooks, and API.',
    snapshot: [
      {
        label: 'Pricing model',
        competitor: 'Tracked users and plan tiers',
        featul: 'Flat workspace; Starter $24/month, Professional $47/month',
      },
      {
        label: 'Default hosting',
        competitor: 'US-centric SaaS',
        featul: 'EU by default',
      },
      {
        label: 'Canny import',
        competitor: 'N/A',
        featul: 'Yes, requests and discussions',
      },
      {
        label: 'Daily integrations',
        competitor: 'Large native marketplace',
        featul: 'Slack, Discord, webhooks, and API',
      },
      {
        label: 'Public roadmap and changelog',
        competitor: 'Yes',
        featul: 'Yes, in the same workspace',
      },
      {
        label: 'Open source / self-host',
        competitor: 'No',
        featul: 'MIT-licensed and self-hostable',
      },
      {
        label: 'Best for',
        competitor: 'Teams whose workflow is the Canny app catalog',
        featul: 'Teams replacing Canny for EU hosting and workspace pricing',
      },
    ],
    guide: [
      {
        title: 'What is the difference between Canny alternatives and Canny integrations?',
        answer:
          '“Canny alternatives” means replace the product. “Canny integrations” means Slack, API, webhooks, and a path to import the board. Featul is a Canny alternative with Canny import plus Slack, webhooks, and API—the jobs most product teams run daily.',
        body: 'Canny still wins if you need a long marketplace of native third-party apps. Featul wins if you want EU hosting, workspace pricing, and roadmap plus changelog in the same tool after you import.',
      },
      {
        title: 'Which Canny integrations does Featul replace?',
        answer:
          'Typical Canny setups notify Slack when a post is created, push status through an API or webhook, and maybe sync an issue tracker. Featul covers Slack notifications, webhooks, and API access so triage does not require a new chat app.',
        body: 'You do not recreate every Canny marketplace connector. You keep the workflow: request comes in, team is pinged, status is visible on a public roadmap, release notes go out. See the Canny integrations page for import steps.',
      },
      {
        title: 'When should you stay on Canny?',
        answer:
          'Stay if your operating system is already a large set of Canny apps (Linear, Jira, Intercom, and others) and switching would break automations you cannot rebuild with webhooks. Switch when seat cost, data residency, or a second changelog tool is the pain.',
        body: 'Featul is not trying to out-catalog Canny. It is trying to be the simpler EU-hosted replacement with import so history is not left behind.',
      },
      {
        title: 'How do you migrate a Canny board to Featul?',
        answer:
          'Create a Featul workspace, import Canny requests and discussions, map statuses and tags, then connect Slack. Share the new board URL, keep voting open, and changelog the first shipped item from the old Canny list.',
        body: 'Voters care that their post still exists and that something shipped. They do not care which vendor rendered the upvote.',
      },
    ],
    features: withCompetitor({
      eu_hosting: false,
      gdpr: 'partial',
      feedback_boards: true,
      feature_voting: true,
      public_roadmap: true,
      changelog: true,
      embeddable_widget: true,
      api: true,
      sso: true,
      slack: true,
    }),
  },
  {
    slug: 'upvoty',
    name: 'Upvoty',
    website: 'https://upvoty.com',
    summary:
      'Upvoty emphasizes boards and voting. Featul aims for an all‑in‑one privacy‑aware suite.',
    tags: ['feedback', 'voting'],
    image: '/image/image.jpeg',
    pros: ['Simple voting flows'],
    cons: ['Fewer privacy controls'],
    features: withCompetitor({
      eu_hosting: 'partial',
      gdpr: 'partial',
      feedback_boards: true,
      feature_voting: true,
      public_roadmap: 'partial',
      changelog: 'partial',
      embeddable_widget: true,
      api: 'partial',
      sso: 'partial',
      slack: true,
    }),
  },
]

// Import from content-matrix for programmatic competitors
import { COMPETITORS, type CompetitorEntry } from '@/lib/data/programmatic/matrix'
import {
  applyCompetitorDetail,
  getCompetitorDetail,
  type CompetitorKind,
} from '@/config/alternatives-detail'

const KIND_FEATURE_DEFAULTS: Record<CompetitorKind, Record<string, FeatureSupport>> = {
  'voting-board': {
    eu_hosting: 'partial',
    gdpr: 'partial',
    feedback_boards: true,
    feature_voting: true,
    public_roadmap: 'partial',
    changelog: 'partial',
    embeddable_widget: true,
    api: 'partial',
    sso: 'partial',
    slack: 'partial',
  },
  'feedback-suite': {
    eu_hosting: 'partial',
    gdpr: 'partial',
    feedback_boards: true,
    feature_voting: true,
    public_roadmap: true,
    changelog: true,
    embeddable_widget: true,
    api: true,
    sso: 'partial',
    slack: true,
  },
  changelog: {
    eu_hosting: 'partial',
    gdpr: 'partial',
    feedback_boards: 'partial',
    feature_voting: 'partial',
    public_roadmap: 'partial',
    changelog: true,
    embeddable_widget: true,
    api: 'partial',
    sso: 'partial',
    slack: 'partial',
  },
  'product-management': {
    eu_hosting: 'partial',
    gdpr: 'partial',
    feedback_boards: 'partial',
    feature_voting: 'partial',
    public_roadmap: true,
    changelog: 'partial',
    embeddable_widget: 'partial',
    api: true,
    sso: true,
    slack: 'partial',
  },
  'visual-feedback': {
    eu_hosting: 'partial',
    gdpr: 'partial',
    feedback_boards: 'partial',
    feature_voting: false,
    public_roadmap: false,
    changelog: false,
    embeddable_widget: true,
    api: 'partial',
    sso: 'partial',
    slack: 'partial',
  },
  'open-source': {
    eu_hosting: false,
    gdpr: 'partial',
    feedback_boards: true,
    feature_voting: true,
    public_roadmap: 'partial',
    changelog: false,
    embeddable_widget: 'partial',
    api: 'partial',
    sso: false,
    slack: false,
  },
  'b2b-feedback': {
    eu_hosting: 'partial',
    gdpr: 'partial',
    feedback_boards: true,
    feature_voting: 'partial',
    public_roadmap: 'partial',
    changelog: 'partial',
    embeddable_widget: 'partial',
    api: true,
    sso: true,
    slack: true,
  },
  linear: {
    eu_hosting: 'partial',
    gdpr: 'partial',
    feedback_boards: true,
    feature_voting: true,
    public_roadmap: true,
    changelog: 'partial',
    embeddable_widget: true,
    api: true,
    sso: 'partial',
    slack: true,
  },
}

function featuresFromVictoryPoints(competitor: CompetitorEntry): Record<string, FeatureSupport> {
  return {
    eu_hosting: competitor.victoryPoints.some((v) => v.toLowerCase().includes('eu')) ? 'partial' : false,
    gdpr: competitor.victoryPoints.some((v) => v.toLowerCase().includes('gdpr')) ? 'partial' : false,
    feedback_boards: true,
    feature_voting: true,
    public_roadmap: competitor.victoryPoints.some((v) => v.toLowerCase().includes('roadmap')) ? true : 'partial',
    changelog: competitor.victoryPoints.some((v) => v.toLowerCase().includes('changelog')) ? true : 'partial',
    embeddable_widget: true,
    api: 'partial',
    sso: 'partial',
    slack: competitor.victoryPoints.some((v) => v.toLowerCase().includes('slack')) ? true : 'partial',
  }
}

/**
 * Convert a CompetitorEntry from content-matrix to Alternative format
 * This allows new competitors to work with existing custom components
 */
function competitorToAlternative(competitor: CompetitorEntry): Alternative {
  const kind = getCompetitorDetail(competitor.slug)?.kind
  const featureDefaults = kind ? KIND_FEATURE_DEFAULTS[kind] : featuresFromVictoryPoints(competitor)

  return applyCompetitorDetail({
    slug: competitor.slug,
    name: competitor.name,
    website: competitor.website,
    tagline: competitor.tagline,
    summary: `${competitor.name} is known for ${competitor.tagline.toLowerCase()}. Featul offers ${competitor.victoryPoints[0]?.toLowerCase() || 'a privacy-first alternative'} with a unified feedback, roadmap, and changelog workflow.`,
    tags: ['feedback', 'roadmap', 'voting'],
    pros: competitor.tradeoffs.slice(0, 2),
    cons: [],
    victoryPoints: competitor.victoryPoints,
    tradeoffs: competitor.tradeoffs,
    image: '/image/image.jpeg',
    features: withCompetitor(featureDefaults),
  })
}

function enrichAlternative(alt: Alternative): Alternative {
  const competitor = COMPETITORS.find((c) => c.slug === alt.slug)
  const merged: Alternative = competitor
    ? {
        ...alt,
        website: alt.website ?? competitor.website,
        tagline: alt.tagline ?? competitor.tagline,
        victoryPoints: alt.victoryPoints?.length ? alt.victoryPoints : competitor.victoryPoints,
        tradeoffs: alt.tradeoffs?.length ? alt.tradeoffs : competitor.tradeoffs,
        summary:
          alt.summary ??
          `${competitor.name} is known for ${competitor.tagline.toLowerCase()}. Featul offers ${competitor.victoryPoints[0]?.toLowerCase() || 'a privacy-first alternative'}.`,
      }
    : alt

  return applyCompetitorDetail(merged)
}

export function getAlternativeBySlug(slug: string): Alternative | undefined {
  const manual = alternatives.find((a) => a.slug === slug)
  if (manual) return enrichAlternative(manual)

  const competitor = COMPETITORS.find((c) => c.slug === slug)
  if (competitor) return competitorToAlternative(competitor)

  return undefined
}

export function getAllAlternatives(): Alternative[] {
  const merged = new Map<string, Alternative>()

  for (const alt of alternatives) {
    merged.set(alt.slug, enrichAlternative(alt))
  }

  for (const competitor of COMPETITORS) {
    if (!merged.has(competitor.slug)) {
      merged.set(competitor.slug, competitorToAlternative(competitor))
    }
  }

  return Array.from(merged.values())
}

export function getAlternativeSlugs(): string[] {
  return getAllAlternatives().map((alternative) => alternative.slug)
}

export function getAlternativePageTitle(alt: Alternative): string {
  if (alt.metaTitle) return alt.metaTitle
  return `Best ${alt.name} alternative | Featul vs ${alt.name}`
}

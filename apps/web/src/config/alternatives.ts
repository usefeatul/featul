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
  guide?: { title: string; body: string }[]
  features: ComparisonFeature[]
}

/** Displayed on comparison pages for freshness signals. */
export const ALTERNATIVES_UPDATED_LABEL = 'August 2026'
export const ALTERNATIVES_UPDATED_ISO = '2026-08-27'

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
    guide: [
      {
        title: 'Who looks for Featurebase alternatives',
        body: 'Most searches for Featurebase alternatives are not “any voting board.” Teams want the same loop Featurebase is known for—boards, votes, a public roadmap, and a changelog—without per-seat pricing, a closed vendor, or US-only hosting defaults. Featul is built as an open source Featurebase alternative: MIT-licensed, self-hostable, EU-hosted by default, and billed per workspace. If you already live in Featurebase’s help-center and AI support suite and do not need self-hosting, staying can still be rational. If the product team, success, and engineering all need seats, the bill is the usual reason people compare.',
      },
      {
        title: 'Open source Featurebase alternative vs hosted-only',
        body: 'An open source Featurebase alternative matters when feedback is customer data you may need to move, self-host, or show to security reviewers. Featul can run as a hosted EU workspace or on your own infrastructure. Featurebase is a strong hosted product; it is not a self-hosted MIT codebase. That difference shows up in procurement, GDPR questionnaires, and “can we leave later?” conversations—not in whether voting works. Both collect requests. Only one lets you keep the board if the vendor relationship ends.',
      },
      {
        title: 'Pricing: seats vs workspace',
        body: 'Featurebase’s paid motion scales primarily with seats as more of the company uses the suite. Featul uses flat workspace plans so adding a PM, a CSM, and two engineers does not multiply the invoice the same way. Compare current numbers on each pricing page before you treat this as a quote. The pattern is the decision: if five people need access, per-seat tools get expensive faster than a workspace cap.',
      },
      {
        title: 'How to migrate from Featurebase',
        body: 'Export or import posts, then recreate categories, tags, and statuses so voters still recognize the board. Point your public URL or widget at Featul, publish the roadmap columns you already use (Planned, In Progress, Shipped), and send a changelog when the first migrated item ships. That close-the-loop moment is what customers notice—not the vendor logo. For messy Featurebase workspaces, map duplicates before you go live so vote counts stay honest.',
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
    guide: [
      {
        title: 'Canny alternatives vs Canny integrations',
        body: 'Google shows two intents on this page. “Canny alternatives” means replace the product. “Canny integrations” means Slack, API, webhooks, and a path to import the board. Featul is a Canny alternative with Canny import plus Slack, webhooks, and API—the jobs most product teams run daily. Canny still wins if you need a long marketplace of native third-party apps. Featul wins if you want EU hosting, workspace pricing, and roadmap plus changelog in the same tool after you import.',
      },
      {
        title: 'What Canny integrations Featul replaces',
        body: 'Typical Canny setups notify Slack when a post is created, push status through an API or webhook, and maybe sync an issue tracker. Featul covers Slack notifications, webhooks, and API access so triage does not require a new chat app. You do not recreate every Canny marketplace connector. You keep the workflow: request comes in, team is pinged, status is visible on a public roadmap, release notes go out. See the Canny integrations page for import steps.',
      },
      {
        title: 'When to stay on Canny',
        body: 'Stay if your operating system is already a large set of Canny apps (Linear, Jira, Intercom, and others) and switching would break automations you cannot rebuild with webhooks. Switch when seat cost, data residency, or “we also bought a changelog tool” is the pain. Featul is not trying to out-catalog Canny. It is trying to be the simpler EU-hosted replacement with import so history is not left behind.',
      },
      {
        title: 'Migrating a Canny board',
        body: 'Create a Featul workspace, import Canny requests and discussions, map statuses and tags, then connect Slack. Share the new board URL, keep voting open, and changelog the first shipped item that came from the old Canny list. Voters care that their post still exists and that something shipped. They do not care which vendor rendered the upvote.',
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

/**
 * Convert a CompetitorEntry from content-matrix to Alternative format
 * This allows new competitors to work with existing custom components
 */
function competitorToAlternative(competitor: CompetitorEntry): Alternative {
  return {
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
    features: withCompetitor({
      eu_hosting: competitor.victoryPoints.some(v => v.toLowerCase().includes('eu')) ? 'partial' : false,
      gdpr: competitor.victoryPoints.some(v => v.toLowerCase().includes('gdpr')) ? 'partial' : false,
      feedback_boards: true,
      feature_voting: true,
      public_roadmap: competitor.victoryPoints.some(v => v.toLowerCase().includes('roadmap')) ? true : 'partial',
      changelog: competitor.victoryPoints.some(v => v.toLowerCase().includes('changelog')) ? true : 'partial',
      embeddable_widget: true,
      api: 'partial',
      sso: 'partial',
      slack: competitor.victoryPoints.some(v => v.toLowerCase().includes('slack')) ? true : 'partial',
    }),
  }
}

function enrichAlternative(alt: Alternative): Alternative {
  const competitor = COMPETITORS.find((c) => c.slug === alt.slug)
  if (!competitor) return alt

  return {
    ...alt,
    website: alt.website ?? competitor.website,
    tagline: alt.tagline ?? competitor.tagline,
    victoryPoints: alt.victoryPoints?.length ? alt.victoryPoints : competitor.victoryPoints,
    tradeoffs: alt.tradeoffs?.length ? alt.tradeoffs : competitor.tradeoffs,
    summary:
      alt.summary ??
      `${competitor.name} is known for ${competitor.tagline.toLowerCase()}. Featul offers ${competitor.victoryPoints[0]?.toLowerCase() || 'a privacy-first alternative'}.`,
  }
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

export type FeatureSupport = boolean | 'partial'

export interface ComparisonFeature {
  key: string
  label: string
  description?: string
  feedgot: FeatureSupport
  competitor: FeatureSupport
}

export interface Alternative {
  slug: string
  name: string
  website?: string
  summary?: string
  description?: string
  tags?: string[]
  pros?: string[]
  cons?: string[]
  image?: string
  features: ComparisonFeature[]
}

// Base features we commonly compare across tools
const baseFeatures: Omit<ComparisonFeature, 'competitor'>[] = [
  { key: 'eu_hosting', label: 'EU Hosting', description: 'Default EU data hosting and residency options. Keeps user data regional by default for compliance and performance.', feedgot: true },
  { key: 'gdpr', label: 'GDPR Compliance', description: 'Built-in consent and data controls aligned with GDPR. Reduce legal overhead with sensible defaults and auditability.', feedgot: true },
  { key: 'feedback_boards', label: 'Feedback Boards', description: 'Collect and organize user feedback in dedicated boards. Prioritize themes and requests with tags and status.', feedgot: true },
  { key: 'feature_voting', label: 'Feature Voting', description: 'Let users upvote ideas to surface priorities. Balance qualitative comments with quantitative signals.', feedgot: true },
  { key: 'public_roadmap', label: 'Public Roadmap', description: 'Share progress publicly with transparent planning. Keep stakeholders aligned with statuses and timelines.', feedgot: true },
  { key: 'changelog', label: 'Changelog', description: 'Publish releases and updates with clean release notes. Auto-link roadmap items to close the loop.', feedgot: true },
  { key: 'embeddable_widget', label: 'Embeddable Widget', description: 'Embed feedback capture directly in your app. Gather context without forcing users to switch surfaces.', feedgot: true },
  { key: 'api', label: 'API Access', description: 'Integrate via API to automate and customize workflows. Sync issues, tags, and statuses with your tools.', feedgot: true },
  { key: 'sso', label: 'SSO', description: 'Single sign-on support for secure, centralized authentication. Works with common identity providers.', feedgot: 'partial' },
  { key: 'slack', label: 'Slack Integration', description: 'Receive notifications and triage feedback in Slack. Respond quickly and keep the team in the loop.', feedgot: true },
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
      'UserJot focuses on lightweight feedback collection. Feedgot offers end‑to‑end feedback, roadmap, and changelog in one.',
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
    summary:
      'Featurebase is a strong feedback tool. Feedgot emphasizes EU hosting and privacy with a unified suite.',
    tags: ['feedback', 'voting'],
    image: '/image/image.jpeg',
    pros: ['Active community', 'Rich voting'],
    cons: ['Less EU focus'],
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
      'Nolt provides boards and voting. Feedgot adds changelog and privacy‑first EU hosting by default.',
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
    summary:
      'Canny is a robust feedback platform. Feedgot differentiates with EU hosting and streamlined privacy.',
    tags: ['feedback', 'roadmap', 'voting'],
    image: '/image/image.jpeg',
    pros: ['Enterprise features'],
    cons: ['US‑centric hosting'],
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
      'Upvoty emphasizes boards and voting. Feedgot aims for an all‑in‑one privacy‑aware suite.',
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

export function getAlternativeBySlug(slug: string): Alternative | undefined {
  return alternatives.find((a) => a.slug === slug)
}

export function getAlternativeSlugs(): string[] {
  return alternatives.map((a) => a.slug)
}
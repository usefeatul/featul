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
  detailedPros?: {
    title: string
    description: string
    category: 'pricing' | 'features' | 'performance' | 'security' | 'support' | 'integration'
  }[]
  detailedCons?: {
    title: string
    description: string
    category: 'pricing' | 'features' | 'performance' | 'security' | 'support' | 'integration'
  }[]
  pricing?: {
    startingPrice: string
    enterprisePrice?: string
    pricingModel: 'per-user' | 'flat-rate' | 'usage-based' | 'tiered'
    freeTier?: boolean
  }
  targetAudience?: string[]
  keyDifferentiators?: string[]
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
    detailedPros: [
      {
        title: 'Simple feedback capture',
        description: 'Easy-to-use interface for collecting user feedback with minimal setup required',
        category: 'features'
      },
      {
        title: 'Clean UI',
        description: 'Modern, intuitive user interface that requires minimal training',
        category: 'features'
      },
      {
        title: 'Lightweight implementation',
        description: 'Quick setup process without complex configuration requirements',
        category: 'performance'
      }
    ],
    detailedCons: [
      {
        title: 'Limited roadmap tooling',
        description: 'Basic roadmap features compared to comprehensive solutions like Feedgot',
        category: 'features'
      },
      {
        title: 'Fewer integrations',
        description: 'Limited third-party integrations and API capabilities',
        category: 'integration'
      },
      {
        title: 'No EU hosting by default',
        description: 'Data residency options not available, potentially problematic for GDPR compliance',
        category: 'security'
      },
      {
        title: 'Expensive scaling',
        description: 'Pricing increases significantly with usage, starting at $29-59/month',
        category: 'pricing'
      }
    ],
    pricing: {
      startingPrice: '$29/month',
      enterprisePrice: '$59/month',
      pricingModel: 'flat-rate',
      freeTier: false
    },
    targetAudience: ['Small startups', 'Individual developers', 'Simple feedback needs'],
    keyDifferentiators: ['Simple setup', 'Basic feedback collection', 'Clean interface'],
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
    detailedPros: [
      {
        title: 'Active community',
        description: 'Strong user community with active discussions and user-generated content',
        category: 'support'
      },
      {
        title: 'Rich voting features',
        description: 'Advanced voting mechanisms and user engagement tools',
        category: 'features'
      },
      {
        title: 'Comprehensive feedback management',
        description: 'Well-established platform with mature feedback collection features',
        category: 'features'
      }
    ],
    detailedCons: [
      {
        title: 'Limited EU focus',
        description: 'Primary data hosting in non-EU regions, potential GDPR compliance issues',
        category: 'security'
      },
      {
        title: 'Expensive pricing',
        description: 'High cost starting at $60-250/month, significantly more than Feedgot',
        category: 'pricing'
      },
      {
        title: 'Closed-source platform',
        description: 'Proprietary software with limited transparency and customization options',
        category: 'features'
      },
      {
        title: 'Vendor lock-in risk',
        description: 'Difficult to migrate data and customize due to closed architecture',
        category: 'integration'
      }
    ],
    pricing: {
      startingPrice: '$60/month',
      enterprisePrice: '$250+/month',
      pricingModel: 'tiered',
      freeTier: false
    },
    targetAudience: ['Medium to large enterprises', 'Established companies', 'Feature-rich needs'],
    keyDifferentiators: ['Active community', 'Rich voting features', 'Established platform'],
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
    detailedPros: [
      {
        title: 'Popular feedback boards',
        description: 'Well-established board system with proven user engagement patterns',
        category: 'features'
      },
      {
        title: 'Excellent user experience',
        description: 'Intuitive interface design with smooth user interactions and workflows',
        category: 'features'
      },
      {
        title: 'Strong community features',
        description: 'Built-in community engagement tools and user interaction capabilities',
        category: 'support'
      },
      {
        title: 'Reliable platform',
        description: 'Stable and mature platform with consistent performance',
        category: 'performance'
      }
    ],
    detailedCons: [
      {
        title: 'Limited privacy controls',
        description: 'Fewer granular privacy settings compared to privacy-first solutions',
        category: 'security'
      },
      {
        title: 'Basic changelog functionality',
        description: 'Limited release note and changelog capabilities',
        category: 'features'
      },
      {
        title: 'No EU hosting by default',
        description: 'Data hosting primarily outside EU, potential compliance challenges',
        category: 'security'
      },
      {
        title: 'Limited integration options',
        description: 'Fewer third-party integrations and API capabilities',
        category: 'integration'
      }
    ],
    pricing: {
      startingPrice: '$29/month',
      enterprisePrice: '$99/month',
      pricingModel: 'tiered',
      freeTier: false
    },
    targetAudience: ['Medium-sized companies', 'Community-focused teams', 'Board-centric workflows'],
    keyDifferentiators: ['Popular board system', 'Excellent UX', 'Community features'],
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
    detailedPros: [
      {
        title: 'Comprehensive enterprise features',
        description: 'Advanced enterprise-grade functionality including SSO, advanced permissions, and admin controls',
        category: 'features'
      },
      {
        title: 'Robust integration ecosystem',
        description: 'Wide range of third-party integrations with popular business tools',
        category: 'integration'
      },
      {
        title: 'Advanced analytics and reporting',
        description: 'Detailed analytics dashboard with custom reports and insights',
        category: 'features'
      },
      {
        title: 'Mature platform stability',
        description: 'Well-established platform with proven reliability and uptime',
        category: 'performance'
      }
    ],
    detailedCons: [
      {
        title: 'US-centric hosting model',
        description: 'Primary data centers located in US, limited EU hosting options for GDPR compliance',
        category: 'security'
      },
      {
        title: 'Expensive enterprise pricing',
        description: 'High cost starting at $50-400/month, significantly more expensive than competitors',
        category: 'pricing'
      },
      {
        title: 'Complex feature-heavy interface',
        description: 'Feature-rich but potentially overwhelming interface for smaller teams',
        category: 'features'
      },
      {
        title: 'Limited open-source transparency',
        description: 'Closed-source platform with limited customization and vendor lock-in concerns',
        category: 'features'
      }
    ],
    pricing: {
      startingPrice: '$50/month',
      enterprisePrice: '$400+/month',
      pricingModel: 'tiered',
      freeTier: false
    },
    targetAudience: ['Large enterprises', 'Complex organizations', 'Advanced feature needs'],
    keyDifferentiators: ['Enterprise-grade features', 'Advanced integrations', 'Comprehensive analytics'],
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
    detailedPros: [
      {
        title: 'Simple voting flows',
        description: 'Streamlined voting interface with intuitive board organization and user engagement',
        category: 'features'
      },
      {
        title: 'Affordable pricing tiers',
        description: 'Competitive pricing starting at $15-49/month for small to medium teams',
        category: 'pricing'
      },
      {
        title: 'Quick setup process',
        description: 'Easy onboarding with minimal configuration required to get started',
        category: 'integration'
      },
      {
        title: 'Board-centric approach',
        description: 'Strong focus on board-based feedback collection and organization',
        category: 'features'
      }
    ],
    detailedCons: [
      {
        title: 'Fewer privacy controls',
        description: 'Limited privacy settings and data protection options compared to privacy-first solutions',
        category: 'security'
      },
      {
        title: 'Limited EU hosting options',
        description: 'Data hosting primarily outside EU, potential GDPR compliance challenges',
        category: 'security'
      },
      {
        title: 'Basic analytics capabilities',
        description: 'Limited reporting and analytics features compared to enterprise solutions',
        category: 'features'
      },
      {
        title: 'Fewer integration options',
        description: 'Limited third-party integrations and API functionality',
        category: 'integration'
      }
    ],
    pricing: {
      startingPrice: '$15/month',
      enterprisePrice: '$49/month',
      pricingModel: 'tiered',
      freeTier: false
    },
    targetAudience: ['Small teams', 'Voting-focused workflows', 'Budget-conscious teams'],
    keyDifferentiators: ['Simple voting flows', 'Affordable pricing', 'Board-centric approach'],
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
export type PricingPlanKey = 'free' | 'starter' | 'professional' | 'self_hosted'

export type PricingPlan = {
  key: PricingPlanKey
  name: string
  price: string
  note: string
  ctaLabel: string
  href: string
  features: string[]
}

export const topPlans: PricingPlan[] = [
  {
    key: 'free',
    name: 'Free',
    price: '$0/mo',
    note: 'Ideal for getting started',
    ctaLabel: 'Start for free',
    href: 'https://app.featul.com/auth/sign-up',
    features: [
      'Up to 3 team members',
      'File attachments',
      'Essential tagging and changelog tools',
      'Structured tags for organizing feedback',
      'Changelog tags for release updates',
      'No integrations or imports',
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '$20/mo',
    note: 'For growing teams',
    ctaLabel: 'Start free trial',
    href: 'https://app.featul.com/auth/sign-up',
    features: [
      'Up to 5 team members',
      'Unlimited boards',
      'Branding controls',
      'Integrations and imports',
      'Lower tagging limits',
      'Full changelog management',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    price: '$45/mo',
    note: 'For advanced teams',
    ctaLabel: 'Start free trial',
    href: 'https://app.featul.com/auth/sign-up',
    features: [
      'Everything in Starter',
      'Up to 10 team members',
      'Higher tagging limits',
      'Unlimited changelog entries',
      'Best for scale',
    ],
  },
]

export const selfHostedPlan: PricingPlan = {
  key: 'self_hosted',
  name: 'Freedom (Self‑Hosted)',
  price: 'Open Source',
  note: 'All Enterprise features',
  ctaLabel: 'View docs',
  href: '/docs',
  features: [
    'Full source code access',
    'Complete data control',
    'No usage limits',
    'Custom modifications',
    'Community support',
  ],
}

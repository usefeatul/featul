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
    note: 'Free forever',
    ctaLabel: 'Start for free',
    href: 'https://app.featul.com/auth/sign-up',
    features: [
      '3 team members',
      'Attachments included',
      'Up to 5 tags',
      'Up to 5 changelog tags',
      'Up to 10 changelog entries',
      'No integrations or data imports',
    ],
  },
  {
    key: 'starter',
    name: 'Starter',
    price: '$20/mo',
    note: 'Save 20% annually',
    ctaLabel: 'Start 14-day trial',
    href: 'https://app.featul.com/auth/sign-up',
    features: [
      '5 team members',
      'Attachments included',
      'Branding + hide Powered by',
      'Integrations included',
      'Data imports included',
      'Up to 10 tags',
      'Up to 10 changelog tags',
      'Up to 50 changelog entries',
      'Unlimited boards',
    ],
  },
  {
    key: 'professional',
    name: 'Professional',
    price: '$45/mo',
    note: 'Save 20% annually',
    ctaLabel: 'Start 14-day trial',
    href: 'https://app.featul.com/auth/sign-up',
    features: [
      'Everything in Starter',
      '10 team members',
      'Attachments included',
      'Branding + hide Powered by',
      'Integrations included',
      'Data imports included',
      'Up to 20 tags',
      'Up to 20 changelog tags',
      'Unlimited changelog entries',
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

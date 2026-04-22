import type { NavigationItem } from './homeNav'

export interface FooterNavGroup {
  title: string
  items: NavigationItem[]
}

export interface FooterNavigationConfig {
  groups: FooterNavGroup[]
}

export const footerNavigationConfig: FooterNavigationConfig = {
  groups: [
    {
      title: 'Product',
      items: [
        { name: 'Pricing', href: '/pricing' },
        { name: 'Docs', href: '/docs' },
        { name: 'Integrations', href: '/integrations' },
      ],
    },
    {
      title: 'Features',
      items: [
        { name: 'Boards', href: '/docs/getting-started/create-boards' },
        { name: 'Dashboard', href: '/docs/getting-started/overview' },
        { name: 'Roadmap', href: '/docs/getting-started/plan-roadmap' },
        { name: 'Changelog', href: '/docs/getting-started/publish-updates' },
      ],
    },
    {
      title: 'Alternatives',
      items: [
        { name: 'UserJot', href: '/alternatives/userjot' },
        { name: 'Featurebase', href: '/alternatives/featurebase' },
        { name: 'Nolt', href: '/alternatives/nolt' },
        { name: 'Canny', href: '/alternatives/canny' },
        { name: 'Upvoty', href: '/alternatives/upvoty' },
        { name: 'More', href: '/alternatives' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { name: 'Blog', href: '/blog' },
        { name: 'Tools', href: '/tools' },
        { name: 'Definitions', href: '/definitions' },
        { name: 'Use cases', href: '/use-cases' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { name: 'Terms', href: '/terms' },
        { name: 'Privacy', href: '/privacy' },
        { name: 'GDPR', href: '/gdpr' },
      ],
    },
  ],
}

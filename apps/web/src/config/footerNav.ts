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
        { name: 'Status page', href: '#' },
      ],
    },
    {
      title: 'Alternatives',
      items: [
        { name: 'UserJot', href: '#' },
        { name: 'Featurebase', href: '#' },
        { name: 'Nolt', href: '#' },
        { name: 'Canny', href: '#' },
        { name: 'Upvoty', href: '#' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { name: 'Blog', href: '/blog' },

      ],
    },
    {
      title: 'Legal',
      items: [
        { name: 'Terms', href: '#' },
        { name: 'Privacy', href: '#' },
        { name: 'GDPR', href: '#' },
      ],
    },
  ],
}
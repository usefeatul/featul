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
        { name: 'Features', href: '#' },
        { name: 'Solution', href: '#' },
        { name: 'Customers', href: '#' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Help', href: '#' },
        { name: 'About', href: '#' },
      ],
    },
    {
      title: 'Solution',
      items: [
        { name: 'Startup', href: '#' },
        { name: 'Freelancers', href: '#' },
        { name: 'Organizations', href: '#' },
        { name: 'Students', href: '#' },
        { name: 'Collaboration', href: '#' },
        { name: 'Design', href: '#' },
        { name: 'Management', href: '#' },
      ],
    },
    {
      title: 'Company',
      items: [
        { name: 'About', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press', href: '#' },
        { name: 'Contact', href: '#' },
        { name: 'Help', href: '#' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { name: 'Licence', href: '#' },
        { name: 'Privacy', href: '#' },
        { name: 'Cookies', href: '#' },
        { name: 'Security', href: '#' },
      ],
    },
  ],
}
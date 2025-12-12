export interface NavigationItem {
  name: string
  href: string
  external?: boolean
}

export interface NavigationConfig {
  main: NavigationItem[]
  auth: NavigationItem[]
}

export const navigationConfig: NavigationConfig = {
  main: [
    {
      name: 'Pricing',
      href: '/pricing',
    },
    {
      name: 'Blog',
      href: '/blog',
    },
    {
      name: 'Docs',
      href: '/docs',
    },
  ],
  auth: [
    {
      name: 'Sign in',
      href: 'https://app.oreilla.com/auth/signin',
    },
  ],
}
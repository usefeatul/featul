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
      name: 'Product',
      href: '/product',
    },
    {
      name: 'Pricing',
      href: '/pricing',
    },
    {
      name: 'Blog',
      href: '/blog',
    },
    {
      name: 'Help',
      href: '/help',
    },
  ],
  auth: [
    {
      name: 'Sign in',
      href: '/signin',
    },
  ],
}
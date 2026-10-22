import { AUTH_SIGN_IN_URL } from "@/config/auth";
import { DOCS_HOME_HREF } from "@/config/docsNav";

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
      href: DOCS_HOME_HREF,
    },
  ],
  auth: [
    {
      name: 'Sign in',
      href: AUTH_SIGN_IN_URL,
    },
  ],
}
/** Sidebar/nav entry; match/exact control active state, replace uses history replace. */
export type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
  match?: string
  exact?: boolean
  replace?: boolean
}


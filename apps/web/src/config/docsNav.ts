export interface DocsNavItem {
  id: string
  label: string
  href: string
}

export interface DocsNavSection {
  label: string
  items: DocsNavItem[]
}

export type DocsNavEntry = DocsNavItem & { sectionLabel: string }

export function flattenDocsNav(sections: DocsNavSection[] = docsSections): DocsNavEntry[] {
  return sections.flatMap((section) =>
    section.items.map((item) => ({ ...item, sectionLabel: section.label })),
  )
}

export function findDocsNav(pathname: string, sections: DocsNavSection[] = docsSections) {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return { sectionLabel: section.label, item }
      }
    }
  }
  return null
}

export function getDocsNeighbors(pathname: string, sections: DocsNavSection[] = docsSections) {
  const items = flattenDocsNav(sections)
  const index = items.findIndex((item) => item.href === pathname)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: items[index - 1] ?? null,
    next: items[index + 1] ?? null,
  }
}

export const docsSections: DocsNavSection[] = [
  {
    label: "Introduction",
    items: [
      { id: "getting-started/overview", label: "What is Featul?", href: "/docs/getting-started/overview" },
      { id: "getting-started/index", label: "Getting Started", href: "/docs/getting-started" },
    ],
  },
  {
    label: "Getting Started",
    items: [
      { id: "getting-started/create-boards", label: "Create Boards", href: "/docs/getting-started/create-boards" },
      { id: "getting-started/invite-members", label: "Invite Members", href: "/docs/getting-started/invite-members" },
      { id: "getting-started/plan-roadmap", label: "Plan Roadmap", href: "/docs/getting-started/plan-roadmap" },
      { id: "getting-started/publish-updates", label: "Publish Updates", href: "/docs/getting-started/publish-updates" },
      { id: "getting-started/private-boards", label: "Private Boards", href: "/docs/getting-started/private-boards" },
      { id: "getting-started/organize-feedback", label: "Organize Feedback", href: "/docs/getting-started/organize-feedback" },
      { id: "getting-started/guest-feedback", label: "Guest Feedback", href: "/docs/getting-started/guest-feedback" },
      { id: "getting-started/widget", label: "Embed Widget", href: "/docs/getting-started/widget" },
      { id: "getting-started/mask-identities", label: "Mask Identities", href: "/docs/getting-started/mask-identities" },
    ],
  },
  {
    label: "Branding & Setup",
    items: [
      { id: "branding-setup/branding", label: "Branding", href: "/docs/branding-setup/branding" },
      { id: "branding-setup/domain", label: "Custom Domain", href: "/docs/branding-setup/domain" },
      { id: "branding-setup/integrations", label: "Integrations", href: "/docs/branding-setup/integrations" },
      { id: "branding-setup/data", label: "Import & Export", href: "/docs/branding-setup/data" },
    ],
  },
  {
    label: "Shortcuts",
    items: [
      { id: "getting-started/shortcuts", label: "Keyboard Shortcuts", href: "/docs/getting-started/shortcuts" },
    ],
  },
  {
    label: "Open Source",
    items: [
      { id: "open-source/index", label: "Overview", href: "/docs/open-source" },
    ],
  },
]

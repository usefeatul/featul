export interface DocsNavItem {
  label: string
  href: string
}

export interface DocsNavSection {
  label: string
  items: DocsNavItem[]
}

export const docsSections: DocsNavSection[] = [
  {
    label: "Getting Started",
    items: [
      { label: "Create Boards", href: "/docs/create-boards" },
      { label: "Invite Members", href: "/docs/invite-members" },
      { label: "Plan Roadmap", href: "/docs/plan-roadmap" },
      { label: "Publish Updates", href: "/docs/publish-updates" },
      { label: "Private Boards", href: "/docs/private-boards" },
      { label: "Smart Grouping", href: "/docs/smart-grouping" },
      { label: "Guest Feedback", href: "/docs/guest-feedback" },
      { label: "Add UserJot Links", href: "/docs/add-userjot-links" },
      { label: "Mask Identities", href: "/docs/mask-identities" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { label: "Subdomain tracking", href: "/docs/advanced/subdomain-tracking" },
      { label: "Custom events", href: "/docs/advanced/custom-events" },
      { label: "Identify", href: "/docs/advanced/identify" },
      { label: "Persist", href: "/docs/advanced/persist" },
    ],
  },
]


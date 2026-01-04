export interface DocsNavItem {
  id: string
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
      { id: "getting-started/index", label: "Getting Started", href: "/docs" },
      { id: "getting-started/create-boards", label: "Create Boards", href: "/docs/create-boards" },
      { id: "getting-started/invite-members", label: "Invite Members", href: "/docs/invite-members" },
      { id: "getting-started/plan-roadmap", label: "Plan Roadmap", href: "/docs/plan-roadmap" },
      { id: "getting-started/publish-updates", label: "Publish Updates", href: "/docs/publish-updates" },
      { id: "getting-started/private-boards", label: "Private Boards", href: "/docs/private-boards" },
      { id: "getting-started/smart-grouping", label: "Smart Grouping", href: "/docs/smart-grouping" },
      { id: "getting-started/guest-feedback", label: "Guest Feedback", href: "/docs/guest-feedback" },
      { id: "getting-started/add-userjot-links", label: "Add UserJot Links", href: "/docs/add-userjot-links" },
      { id: "getting-started/mask-identities", label: "Mask Identities", href: "/docs/mask-identities" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { id: "advanced/subdomain-tracking", label: "Subdomain tracking", href: "/docs/advanced/subdomain-tracking" },
      { id: "advanced/custom-events", label: "Custom events", href: "/docs/advanced/custom-events" },
      { id: "advanced/identify", label: "Identify", href: "/docs/advanced/identify" },
      { id: "advanced/persist", label: "Persist", href: "/docs/advanced/persist" },
    ],
  },
]

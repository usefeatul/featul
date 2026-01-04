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
      { id: "getting-started/index", label: "Getting Started", href: "/docs/getting-started" },
      { id: "getting-started/create-boards", label: "Create Boards", href: "/docs/getting-started/create-boards" },
      { id: "getting-started/invite-members", label: "Invite Members", href: "/docs/getting-started/invite-members" },
      { id: "getting-started/plan-roadmap", label: "Plan Roadmap", href: "/docs/getting-started/plan-roadmap" },
      { id: "getting-started/publish-updates", label: "Publish Updates", href: "/docs/getting-started/publish-updates" },
      { id: "getting-started/private-boards", label: "Private Boards", href: "/docs/getting-started/private-boards" },
      { id: "getting-started/smart-grouping", label: "Smart Grouping", href: "/docs/getting-started/smart-grouping" },
      { id: "getting-started/guest-feedback", label: "Guest Feedback", href: "/docs/getting-started/guest-feedback" },
      { id: "getting-started/add-userjot-links", label: "Add UserJot Links", href: "/docs/getting-started/add-userjot-links" },
      { id: "getting-started/mask-identities", label: "Mask Identities", href: "/docs/getting-started/mask-identities" },
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

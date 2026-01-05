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
      { id: "getting-started/smart-grouping", label: "Smart Grouping", href: "/docs/getting-started/smart-grouping" },
      { id: "getting-started/guest-feedback", label: "Guest Feedback", href: "/docs/getting-started/guest-feedback" },
      { id: "getting-started/add-userjot-links", label: "Add UserJot Links", href: "/docs/getting-started/add-userjot-links" },
      { id: "getting-started/mask-identities", label: "Mask Identities", href: "/docs/getting-started/mask-identities" },
    ],
  },
  {
    label: "Branding & Setup",
    items: [
      { id: "branding-setup/branding", label: "Branding", href: "/docs/branding-setup/branding" },
      { id: "branding-setup/domain", label: "Custom Domain", href: "/docs/branding-setup/domain" },
      { id: "branding-setup/integrations", label: "Integrations", href: "/docs/branding-setup/integrations" },
      { id: "branding-setup/sso", label: "Single Sign-On", href: "/docs/branding-setup/sso" },
    ],
  },
  {
    label: "Open Source",
    items: [
      { id: "open-source/index", label: "Overview", href: "/docs/open-source" },
    ],
  },
]

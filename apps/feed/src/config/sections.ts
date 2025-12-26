export type SettingsSection = { value: string; label: string; desc: string }

export const SECTIONS: SettingsSection[] = [
  { value: "branding", label: "Branding", desc: "Customize logo and identity" },
  { value: "team", label: "Team", desc: "Manage members and roles" },
  { value: "feedback", label: "Feedback", desc: "Configure boards and feedback" },
  { value: "changelog", label: "Changelog", desc: "Manage product updates" },
  { value: "board", label: "Board Settings", desc: "Configure board settings" },
  { value: "billing", label: "Billing", desc: "Subscriptions and invoices" },
  { value: "domain", label: "Domain", desc: "Custom domain settings" },
  { value: "integrations", label: "Integrations", desc: "Connect external tools" },
  { value: "sso", label: "SSO", desc: "Single sign-on setup" },
  { value: "data", label: "Data", desc: "Export and data controls" },
]

export function getSectionMeta(v: string) {
  const found = SECTIONS.find((s) => s.value === v)
  return found || { value: "branding", label: "Settings", desc: "View and manage your workspace settings." }
}

export const WORKSPACE_TITLES: Record<string, string> = {
  roadmap: "Roadmap",
  changelog: "Changelog",
  settings: "Settings",
  system: "System",
  requests: "Requests",
  account: "Account",
  members: "Members",
}

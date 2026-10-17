export type SettingsSection = {
  value: string;
  label: string;
  desc: string;
  group: "Workspace" | "Product" | "Connections";
};

export const SECTIONS: SettingsSection[] = [
  {
    value: "branding",
    group: "Workspace",
    label: "Branding",
    desc: "Customize logo and identity",
  },
  {
    value: "team",
    group: "Workspace",
    label: "Team",
    desc: "Manage members and roles",
  },
  {
    value: "feedback",
    group: "Product",
    label: "Feedback",
    desc: "Configure boards and feedback",
  },
  {
    value: "changelog",
    group: "Product",
    label: "Changelog",
    desc: "Manage product updates",
  },
  {
    value: "board",
    group: "Product",
    label: "Board Settings",
    desc: "Configure board settings",
  },
  {
    value: "billing",
    group: "Workspace",
    label: "Billing",
    desc: "Subscriptions and invoices",
  },
  {
    value: "domain",
    group: "Workspace",
    label: "Domain",
    desc: "Custom domain settings",
  },
  {
    value: "integrations",
    group: "Connections",
    label: "Integrations",
    desc: "Connect external tools",
  },
  {
    value: "data",
    group: "Connections",
    label: "Data",
    desc: "Export and data controls",
  },
  {
    value: "workspace",
    group: "Workspace",
    label: "Workspace",
    desc: "Manage workspace settings",
  },
];

/** Workspace settings nav metadata. Unknown keys fall back to branding. */
export function getSectionMeta(v: string) {
  const found = SECTIONS.find((s) => s.value === v);
  return (
    found || {
      value: "branding",
      group: "Workspace",
      label: "Settings",
      desc: "View and manage your workspace settings.",
    }
  );
}

export const WORKSPACE_TITLES: Record<string, string> = {
  roadmap: "Roadmap",
  changelog: "Changelog",
  settings: "Settings",
  system: "System",
  requests: "Requests",
  account: "Account",
  members: "Members",
};

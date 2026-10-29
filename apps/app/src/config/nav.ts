import {
  AccountIcon as WorkspaceAccountIcon,
  ArchiveIcon as WorkspaceArchiveIcon,
  BillingIcon as WorkspaceBillingIcon,
  BoardIcon as WorkspaceBoardIcon,
  ChangelogIcon as WorkspaceChangelogIcon,
  DocsIcon as WorkspaceDocsIcon,
  HelpCenterIcon as WorkspaceHelpIcon,
  DomainIcon as WorkspaceDomainIcon,
  ExportIcon as WorkspaceExportIcon,
  CollectIcon as WorkspaceFeedbackIcon,
  ImageIcon as WorkspaceImageIcon,
  IntegrationIcon as WorkspaceIntegrationIcon,
  MemberIcon as WorkspaceMembersIcon,
  RoadmapIcon as WorkspaceRoadmapIcon,
  SettingIcon as WorkspaceSettingsIcon,
  ShareIcon,
  PlannedIcon,
  ProgressIcon,
  ReviewIcon,
  CompletedIcon,
  PendingIcon,
  ClosedIcon,
} from "@/components/global/icons";

import type { NavItem } from "../types/nav";
import { SECTIONS } from "./sections";
import { workspaceHost } from "./domain";

/** Path under `/workspaces/{slug}`. Empty slug uses `/workspaces{p}`. */
function w(slug: string, p: string) {
  return slug ? `/workspaces/${slug}${p}` : `/workspaces${p}`;
}

/** Public board origin: custom domain if set, else `{slug}.{ROOT_DOMAIN}`. */
export function publicBoardUrlForWorkspace(
  slug: string,
  customDomain?: string | null,
) {
  const s = (slug || "").trim();
  if (customDomain && customDomain.trim())
    return `https://${customDomain.trim()}`;
  return `https://${workspaceHost(s)}`;
}

/** Workspace slug from `/workspaces/{slug}/…`. */
export function getSlugFromPath(pathname: string) {
  const parts = pathname.split("/");
  return parts[2] || "";
}

/** True when the path is `/workspaces/{slug}/settings…`. */
export function isWorkspaceSettingsPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("workspaces");
  return idx >= 0 && parts[idx + 2] === "settings";
}

/** Status-filtered request links for the top nav. */
export function buildTopNav(slug: string): NavItem[] {
  const empty = encodeURIComponent(JSON.stringify([]));
  function buildHref(statuses: string[]) {
    const s = encodeURIComponent(JSON.stringify(statuses));
    return w(
      slug,
      `/requests?status=${s}&board=${empty}&tag=${empty}&order=newest&search=`,
    );
  }
  return [
    { label: "Pending", href: buildHref(["PENDING"]), icon: PendingIcon },
    { label: "Review", href: buildHref(["REVIEW"]), icon: ReviewIcon },
    { label: "Planned", href: buildHref(["PLANNED"]), icon: PlannedIcon },
    { label: "Progress", href: buildHref(["PROGRESS"]), icon: ProgressIcon },
    { label: "Completed", href: buildHref(["COMPLETED"]), icon: CompletedIcon },
    { label: "Closed", href: buildHref(["CLOSED"]), icon: ClosedIcon },
  ];
}

/** Roadmap, changelog, help center, members, public board, and settings links. */
export function buildMiddleNav(
  slug: string,
  customDomain?: string | null,
): NavItem[] {
  return [
    { label: "Roadmap", href: w(slug, "/roadmap"), icon: WorkspaceRoadmapIcon },
    {
      label: "Changelog",
      href: w(slug, "/changelog"),
      icon: WorkspaceChangelogIcon,
    },
    { label: "Help Center", href: w(slug, "/help"), icon: WorkspaceHelpIcon },
    { label: "Members", href: w(slug, "/members"), icon: WorkspaceMembersIcon },
    { label: "Share", href: w(slug, "/share"), icon: ShareIcon },
    {
      label: "My Board",
      href: publicBoardUrlForWorkspace(slug, customDomain),
      icon: WorkspaceBoardIcon,
      external: true,
    },
    {
      label: "Settings",
      href: w(slug, "/settings/branding"),
      icon: WorkspaceSettingsIcon,
      match: w(slug, "/settings"),
    },
  ];
}

/** Footer docs link (external). */
export function buildBottomNav(): NavItem[] {
  return [
    {
      label: "Docs",
      href: "https://www.featul.com/docs",
      icon: WorkspaceDocsIcon,
      external: true,
    },
  ];
}

const SETTINGS_ICONS: Record<string, NavItem["icon"]> = {
  account: WorkspaceAccountIcon,
  branding: WorkspaceImageIcon,
  team: WorkspaceMembersIcon,
  feedback: WorkspaceFeedbackIcon,
  changelog: WorkspaceChangelogIcon,
  help: WorkspaceHelpIcon,
  board: WorkspaceBoardIcon,
  billing: WorkspaceBillingIcon,
  domain: WorkspaceDomainIcon,
  integrations: WorkspaceIntegrationIcon,
  data: WorkspaceExportIcon,
  workspace: WorkspaceArchiveIcon,
};

/** Settings sidebar from `SECTIONS`. `replace` avoids stacking history. */
export function buildSettingsNav(slug: string): NavItem[] {
  return SECTIONS.map((section) => ({
    label: section.label,
    href: w(slug, `/settings/${section.value}`),
    icon: SETTINGS_ICONS[section.value] || WorkspaceSettingsIcon,
    replace: true,
  }));
}

/** Named groups for the settings sidebar, keeping the flat navigation API available. */
export function buildSettingsNavGroups(
  slug: string,
): { title: string; items: NavItem[] }[] {
  const items = buildSettingsNav(slug);
  return (["Personal", "Workspace", "Product", "Connections"] as const).map(
    (title) => ({
      title,
      items: items.filter((_, index) => SECTIONS[index]?.group === title),
    }),
  );
}

/** `/workspaces/{slug}` with no extra path. */
export function workspaceBase(slug: string) {
  return w(slug, "");
}

/** `/workspaces/{slug}/requests`. */
export function requestsBase(slug: string) {
  return w(slug, "/requests");
}

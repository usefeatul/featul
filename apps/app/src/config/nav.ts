import PlannedIcon from "@featul/ui/icons/planned"
import ProgressIcon from "@featul/ui/icons/progress"
import ReviewIcon from "@featul/ui/icons/review"
import CompletedIcon from "@featul/ui/icons/completed"
import PendingIcon from "@featul/ui/icons/pending"
import ClosedIcon from "@featul/ui/icons/closed"
import { RoadmapIcon } from "@featul/ui/icons/roadmap"
import { ChangelogIcon } from "@featul/ui/icons/changelog"
import { BoardIcon } from "@featul/ui/icons/board"
import { SettingIcon } from "@featul/ui/icons/setting"
import { DocIcon } from "@featul/ui/icons/doc"
import MemberIcon from "@featul/ui/icons/member"
import ImageIcon from "@featul/ui/icons/image"
import FeedbackIcon from "@featul/ui/icons/feedback"
import DomainIcon from "@featul/ui/icons/domain"
import IntegrationIcon from "@featul/ui/icons/integration"
import FileExportIcon from "@featul/ui/icons/file-export"
import BoxIcon from "@featul/ui/icons/box"
import CreditCardIcon from "@featul/ui/icons/credit-card"
import AccountIcon from "@featul/ui/icons/account"
import ShieldIcon from "@featul/ui/icons/shield"
import LayersIcon from "@featul/ui/icons/layers"
import type { NavItem } from "../types/nav"
import { SECTIONS } from "./sections"
import { ACCOUNT_SECTIONS } from "./account/sections"

/** Path under `/workspaces/{slug}`. Empty slug uses `/workspaces{p}`. */
function w(slug: string, p: string) {
  return slug ? `/workspaces/${slug}${p}` : `/workspaces${p}`
}

/** Public board origin: custom domain if set, else `{slug}.featul.com`. */
function publicBoardUrlForWorkspace(slug: string, customDomain?: string | null) {
  const s = (slug || "").trim()
  if (customDomain && customDomain.trim()) return `https://${customDomain.trim()}`
  return `https://${s}.featul.com`
}

/** Workspace slug from `/workspaces/{slug}/…`. */
export function getSlugFromPath(pathname: string) {
  const parts = pathname.split("/")
  return parts[2] || ""
}

/** True when the path is `/workspaces/{slug}/settings…`. */
export function isWorkspaceSettingsPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  const idx = parts.indexOf("workspaces")
  return idx >= 0 && parts[idx + 2] === "settings"
}

/** True when the path is `/workspaces/{slug}/account…`. */
export function isWorkspaceAccountPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  const idx = parts.indexOf("workspaces")
  return idx >= 0 && parts[idx + 2] === "account"
}

/** Status-filtered request links for the top nav. */
export function buildTopNav(slug: string): NavItem[] {
  const empty = encodeURIComponent(JSON.stringify([]))
  function buildHref(statuses: string[]) {
    const s = encodeURIComponent(JSON.stringify(statuses))
    return w(slug, `/requests?status=${s}&board=${empty}&tag=${empty}&order=newest&search=`)
  }
  return [
    { label: "Planned", href: buildHref(["PLANNED"]), icon: PlannedIcon },
    { label: "Progress", href: buildHref(["PROGRESS"]), icon: ProgressIcon },
    { label: "Review", href: buildHref(["REVIEW"]), icon: ReviewIcon },
    { label: "Completed", href: buildHref(["COMPLETED"]), icon: CompletedIcon },
    { label: "Pending", href: buildHref(["PENDING"]), icon: PendingIcon },
    { label: "Closed", href: buildHref(["CLOSED"]), icon: ClosedIcon },
  ]
}

/** Roadmap, changelog, members, public board, and settings links. */
export function buildMiddleNav(slug: string, customDomain?: string | null): NavItem[] {
  return [
    { label: "Roadmap", href: w(slug, "/roadmap"), icon: RoadmapIcon },
    { label: "Changelog", href: w(slug, "/changelog"), icon: ChangelogIcon },
    { label: "Members", href: w(slug, "/members"), icon: MemberIcon },
    { label: "My Board", href: publicBoardUrlForWorkspace(slug, customDomain), icon: BoardIcon, external: true },
    { label: "Settings", href: w(slug, "/settings/branding"), icon: SettingIcon, match: w(slug, "/settings") },
  ]
}

/** Footer docs link (external). */
export function buildBottomNav(): NavItem[] {
  return [
    { label: "Docs", href: "https://www.featul.com/docs", icon: DocIcon, external: true },
  ]
}

const SETTINGS_ICONS: Record<string, NavItem["icon"]> = {
  branding: ImageIcon,
  team: MemberIcon,
  feedback: FeedbackIcon,
  changelog: ChangelogIcon,
  board: BoardIcon,
  billing: CreditCardIcon,
  domain: DomainIcon,
  integrations: IntegrationIcon,
  data: FileExportIcon,
  workspace: BoxIcon,
}

/** Settings sidebar from `SECTIONS`. `replace` avoids stacking history. */
export function buildSettingsNav(slug: string): NavItem[] {
  return SECTIONS.map((section) => ({
    label: section.label,
    href: w(slug, `/settings/${section.value}`),
    icon: SETTINGS_ICONS[section.value] || SettingIcon,
    replace: true,
  }))
}

const ACCOUNT_ICONS: Record<string, NavItem["icon"]> = {
  profile: AccountIcon,
  security: ShieldIcon,
  appearance: LayersIcon,
}

/** Account sidebar from `ACCOUNT_SECTIONS`. `replace` avoids stacking history. */
export function buildAccountNav(slug: string): NavItem[] {
  return ACCOUNT_SECTIONS.map((section) => ({
    label: section.label,
    href: w(slug, `/account/${section.value}`),
    icon: ACCOUNT_ICONS[section.value] || AccountIcon,
    replace: true,
  }))
}

/** `/workspaces/{slug}` with no extra path. */
export function workspaceBase(slug: string) {
  return w(slug, "")
}

/** `/workspaces/{slug}/requests`. */
export function requestsBase(slug: string) {
  return w(slug, "/requests")
}

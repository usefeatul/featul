import PlannedIcon from "@oreilla/ui/icons/planned"
import ProgressIcon from "@oreilla/ui/icons/progress"
import ReviewIcon from "@oreilla/ui/icons/review"
import CompletedIcon from "@oreilla/ui/icons/completed"
import PendingIcon from "@oreilla/ui/icons/pending"
import ClosedIcon from "@oreilla/ui/icons/closed"
import { RoadmapIcon } from "@oreilla/ui/icons/roadmap"
import { ChangelogIcon } from "@oreilla/ui/icons/changelog"
import { BoardIcon } from "@oreilla/ui/icons/board"
import { SettingIcon } from "@oreilla/ui/icons/setting"
import { AiIcon } from "@oreilla/ui/icons/ai"
import { DocIcon } from "@oreilla/ui/icons/doc"
import type { NavItem } from "../types/nav"

function w(slug: string, p: string) {
  return slug ? `/workspaces/${slug}${p}` : `/workspaces${p}`
}

function publicBoardUrlForWorkspace(slug: string, customDomain?: string | null) {
  const s = (slug || "").trim()
  if (customDomain && customDomain.trim()) return `https://${customDomain.trim()}`
  return `https://${s}.oreilla.com`
}

export function getSlugFromPath(pathname: string) {
  const parts = pathname.split("/")
  return parts[2] || ""
}

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

export function buildMiddleNav(slug: string, customDomain?: string | null): NavItem[] {
  return [
    { label: "Roadmap", href: w(slug, "/roadmap"), icon: RoadmapIcon },
    { label: "Changelog", href: w(slug, "/changelog"), icon: ChangelogIcon },
    { label: "My Board", href: publicBoardUrlForWorkspace(slug, customDomain), icon: BoardIcon, external: true },
    { label: "Settings", href: w(slug, "/settings/branding"), icon: SettingIcon },
  ]
}

export function buildBottomNav(): NavItem[] {
  return [
    { label: "Show AI chat", href: "/chat", icon: AiIcon },
    { label: "Docs", href: "/docs", icon: DocIcon },
  ]
}

export function workspaceBase(slug: string) {
  return w(slug, "")
}

import PlannedIcon from "@feedgot/ui/icons/planned"
import InProgressIcon from "@feedgot/ui/icons/inprogress"
import InReviewingIcon from "@feedgot/ui/icons/inreviewing"
import CompleteIcon from "@feedgot/ui/icons/complete"
import PendingIcon from "@feedgot/ui/icons/pending"
import CloseIcon from "@feedgot/ui/icons/close"
import { RoadmapIcon } from "@feedgot/ui/icons/roadmap"
import { ChangelogIcon } from "@feedgot/ui/icons/changelog"
import { BoardIcon } from "@feedgot/ui/icons/board"
import { SettingIcon } from "@feedgot/ui/icons/setting"
import { AiIcon } from "@feedgot/ui/icons/ai"
import { DocIcon } from "@feedgot/ui/icons/doc"
import type { NavItem } from "../types/nav"

function w(slug: string, p: string) {
  return slug ? `/workspaces/${slug}${p}` : `/workspaces${p}`
}

function publicBoardUrl(slug: string) {
  const s = (slug || "").trim()
  if (!s) return "https://feedgot.com"
  return `https://${s}.feedgot.com`
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
    { label: "Progress", href: buildHref(["PROGRESS"]), icon: InProgressIcon },
    { label: "Review", href: buildHref(["REVIEW"]), icon: InReviewingIcon },
    { label: "Complete", href: buildHref(["COMPLETED"]), icon: CompleteIcon },
    { label: "Pending", href: buildHref(["PENDING"]), icon: PendingIcon },
    { label: "Closed", href: buildHref(["CLOSED"]), icon: CloseIcon },
  ]
}

export function buildMiddleNav(slug: string): NavItem[] {
  return [
    { label: "Roadmap", href: w(slug, "/roadmap"), icon: RoadmapIcon },
    { label: "Changelog", href: w(slug, "/changelog"), icon: ChangelogIcon },
    { label: "My Board", href: publicBoardUrl(slug), icon: BoardIcon, external: true },
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

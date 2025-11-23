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
import type { NavItem } from "../types/types"

function w(slug: string, p: string) {
  return slug ? `/workspaces/${slug}${p}` : `/workspaces${p}`
}

export function getSlugFromPath(pathname: string) {
  const parts = pathname.split("/")
  return parts[2] || ""
}

export function buildTopNav(slug: string): NavItem[] {
  return [
    { label: "Planned", href: w(slug, "/planned"), icon: PlannedIcon },
    { label: "Progress", href: w(slug, "/inprogress"), icon: InProgressIcon },
    { label: "Review", href: w(slug, "/inreviewing"), icon: InReviewingIcon },
    { label: "Complete", href: w(slug, "/complete"), icon: CompleteIcon },
    { label: "Pending", href: w(slug, "/pending"), icon: PendingIcon },
    { label: "Closed", href: w(slug, "/closed"), icon: CloseIcon },
  ]
}

export function buildMiddleNav(slug: string): NavItem[] {
  return [
    { label: "Roadmap", href: w(slug, "/roadmap"), icon: RoadmapIcon },
    { label: "Changelog", href: w(slug, "/changelog"), icon: ChangelogIcon },
    { label: "My Board", href: w(slug, "/board"), icon: BoardIcon },
    { label: "Settings", href: w(slug, "/settings"), icon: SettingIcon },
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

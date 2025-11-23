"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@feedgot/ui/lib/utils"
import { RoadmapIcon } from "@feedgot/ui/icons/roadmap"
import { ChangelogIcon } from "@feedgot/ui/icons/changelog"
import { BoardIcon } from "@feedgot/ui/icons/board"
import { SettingIcon } from "@feedgot/ui/icons/setting"
import { AiIcon } from "@feedgot/ui/icons/ai"
import { DocIcon } from "@feedgot/ui/icons/doc"
import PlannedIcon from "@/components/icons/planned"
import InProgressIcon from "@/components/icons/inprogress"
import InReviewingIcon from "@/components/icons/inreviewing"
import CompleteIcon from "@/components/icons/complete"
import PendingIcon from "@/components/icons/pending"
import CloseIcon from "@/components/icons/close"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<any>
}

const primaryNavBuilder = (slug: string): NavItem[] => [
  { label: "Planned", href: slug ? `/workspaces/${slug}/planned` : "/workspaces/planned", icon: PlannedIcon },
  { label: "In Progress", href: slug ? `/workspaces/${slug}/inprogress` : "/workspaces/inprogress", icon: InProgressIcon },
  { label: "In Reviewing", href: slug ? `/workspaces/${slug}/inreviewing` : "/workspaces/inreviewing", icon: InReviewingIcon },
  { label: "Complete", href: slug ? `/workspaces/${slug}/complete` : "/workspaces/complete", icon: CompleteIcon },
  { label: "Pending", href: slug ? `/workspaces/${slug}/pending` : "/workspaces/pending", icon: PendingIcon },
  { label: "Closed", href: slug ? `/workspaces/${slug}/closed` : "/workspaces/closed", icon: CloseIcon },
]

const secondaryNav: NavItem[] = [
  { label: "Show AI chat", href: "/chat", icon: AiIcon as any },
  { label: "Docs", href: "/docs", icon: DocIcon as any },
]

function Clock() {
  const [now, setNow] = useState<Date>(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(now)
  return <span className="text-xs text-accent">{time}</span>
}

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const parts = pathname.split("/")
  const slug = parts[2] || ""
  const withSlug = (p: string) => (slug ? `/workspaces/${slug}${p}` : `/workspaces${p}`)

  const renderItem = (item: NavItem) => {
    const Icon = item.icon
    const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          "group flex items-center gap-2 rounded-md px-3 py-2 text-sm",
          active ? "bg-card text-foreground" : "text-accent hover:bg-muted",
        )}
      >
        <Icon className="text-foreground/80 group-hover:text-primary transition-colors" />
        <span className="transition-colors">{item.label}</span>
      </Link>
    )
  }

  const primaryNav = primaryNavBuilder(slug)
  return (
    <aside
      className={cn(
        "flex h-screen w-60 flex-col bg-background",
        "md:sticky md:top-0",
        className,
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Feedgot" className="h-6 w-6" />
          <div>
            <div className="text-sm font-semibold">feedgot</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wide text-accent">Time</span>
              <Clock />
            </div>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {primaryNav.map(renderItem)}
      </nav>

      <div className="p-3 mt-8">
        <Link href={withSlug("")} className="block rounded-md px-3 py-2">
          <div className="text-xs text-accent">Workspace</div>
          <div className="text-sm font-medium truncate">{slug || "Current"}</div>
        </Link>
        <div className="mt-3 space-y-1">
          {[
            { label: "Roadmap", href: withSlug("/roadmap"), icon: RoadmapIcon },
            { label: "Changelog", href: withSlug("/changelog"), icon: ChangelogIcon },
            { label: "My Board", href: withSlug("/board"), icon: BoardIcon },
            { label: "Settings", href: withSlug("/settings"), icon: SettingIcon },
          ].map(renderItem)}
        </div>
      </div>

      <div className="mt-auto p-3 space-y-1">
        {secondaryNav.map(renderItem)}
        <Link
          href="/auth/sign-in"
          className="rounded-md px-3 py-2 text-sm text-accent hover:bg-muted"
        >
          Sign out
        </Link>
      </div>
    </aside>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@featul/ui/lib/utils"
import { BoardIcon, ChangelogIcon, RoadmapIcon, RssIcon } from "@/components/global/icons"
import StatusIcon from "@/components/requests/StatusIcon"
import { usePortalData } from "./PortalDataProvider"
import type { PortalStatusCounts } from "@/app/[subdomain]/data"
import { PoweredBy } from "./PoweredBy"
import { ShareIdeaButton } from "./ShareIdeaButton"
import { encodeArray } from "@/utils/request"
import { parseRoadmapStatusFilter } from "@/utils/subdomain/status"

/** `?status=` carries a JSON array; a single-status rail link is the one-element case. */
export function statusHref(basePath: string, status: string) {
  return `${basePath}?status=${encodeURIComponent(encodeArray([status]))}`
}

const DOT_PALETTE = [
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
]

/** Stable colour per board so the rail reads like a help-centre category list. */
export function boardDotClass(index: number) {
  return DOT_PALETTE[index % DOT_PALETTE.length]
}

const STATUS_RAIL: Array<{ status: keyof PortalStatusCounts; label: string }> = [
  { status: "pending", label: "Pending" },
  { status: "review", label: "In review" },
  { status: "planned", label: "Planned" },
  { status: "progress", label: "In progress" },
  { status: "completed", label: "Completed" },
  { status: "closed", label: "Closed" },
]

function RailGroup({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-1.5 flex items-center gap-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
        {icon}
        {title}
      </h2>
      <ul className="space-y-0.5">{children}</ul>
    </section>
  )
}

function RailLink({
  href,
  active,
  leading,
  label,
  count,
}: {
  href: string
  active?: boolean
  leading: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
          active
            ? "bg-sidebar-accent font-medium text-foreground dark:bg-white/[0.07]"
            : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
        )}
      >
        <span className={cn("flex size-4 shrink-0 items-center justify-center", active && "text-primary")}>{leading}</span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {typeof count === "number" ? (
          <span
            className={cn(
              "ml-auto text-xs tabular-nums",
              active ? "text-foreground/70" : "text-muted-foreground/70",
            )}
          >
            {count}
          </span>
        ) : null}
      </Link>
    </li>
  )
}

export function DomainSidebar({
  selectedBoard,
  hideBoards,
}: {
  subdomain?: string
  slug?: string
  initialBoards?: Array<{ id: string; name: string; slug: string; postCount?: number }>
  selectedBoard?: string
  hideSubmitButton?: boolean
  hideBoards?: boolean
  sortBasePath?: string
  sortKeepParams?: string[]
}) {
  const pathname = usePathname() || "/"
  const search = useSearchParams()
  const data = usePortalData()

  const isChangelog = pathname.startsWith("/changelog")
  const isRoadmap = pathname.startsWith("/roadmap")
  const isFeedback = !isChangelog && !isRoadmap
  const currentBoard = selectedBoard || search.get("board") || "__all__"
  const selectedStatuses = parseRoadmapStatusFilter(search.get("status"))
  const currentStatus = selectedStatuses.length === 1 ? selectedStatuses[0] : selectedStatuses.length > 1 ? "__multi__" : ""
  const statusBase = isFeedback
    ? currentBoard === "__all__"
      ? "/"
      : `/board/${currentBoard}`
    : "/"

  return (
    <nav className="min-w-0 space-y-6 md:sticky md:top-20" aria-label="Browse">
      <ShareIdeaButton className="w-full" />
      {!hideBoards ? (
        <RailGroup title="Boards" icon={<BoardIcon className="size-3.5" />}>
          <RailLink
            href="/"
            active={isFeedback && currentBoard === "__all__" && !currentStatus}
            leading={<span className="size-2 rounded-full bg-current opacity-70" />}
            label="All feedback"
            count={data.totalPosts}
          />
          {data.boards.map((b, i) => (
            <RailLink
              key={b.id}
              href={`/board/${b.slug}`}
              active={isFeedback && currentBoard === b.slug && !currentStatus}
              leading={<span className={cn("size-2 rounded-full", boardDotClass(i))} />}
              label={b.name}
              count={b.postCount}
            />
          ))}
        </RailGroup>
      ) : null}

      <RailGroup title="Status" icon={<RoadmapIcon className="size-3.5" />}>
          {STATUS_RAIL.map(({ status, label }) => (
            <RailLink
              key={status}
              href={statusHref(statusBase, status)}
              active={isFeedback && currentStatus === status}
              leading={<StatusIcon status={status} className="size-4" />}
              label={label}
              count={data.statusCounts[status]}
            />
          ))}
      </RailGroup>

      {data.changelogVisible ? (
        <RailGroup title="Updates" icon={<ChangelogIcon className="size-3.5" />}>
          <RailLink
            href="/changelog"
            active={isChangelog}
            leading={<ChangelogIcon className="size-4" />}
            label="Changelog"
            count={data.changelogCount}
          />
          <RailLink
            href="/changelog/feed.xml"
            leading={<RssIcon className="size-4" />}
            label="RSS feed"
          />
        </RailGroup>
      ) : null}

      <PoweredBy className="justify-start px-2.5 pt-2" />
    </nav>
  )
}

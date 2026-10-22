"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { DitherGradient } from "@featul/ui/components/gradient"
import { modalCardInnerClass, modalCardShellClass, raisedSurfaceClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import { Avatar, AvatarFallback } from "@featul/ui/components/avatar"
import {
  ArrowBigUp,
  BoardIcon,
  ChangelogIcon,
  CommentsIcon,
  FeatulLogoIcon,
  IdeaIcon,
  MoonIcon,
  RoadmapIcon,
  RssIcon,
  SearchIcon,
  SunIcon,
} from "@/components/global/icons"
import { ShortcutKey } from "@/components/global/keys"
import { HelpCollectionTile } from "@/components/help/icons"
import StatusIcon from "@/components/requests/StatusIcon"
import { settingsSectionClass, settingsSurfaceHeaderClass } from "@/components/settings/global/SectionCard"
import { navLinkClass } from "@/components/subdomain/DomainHeader"
import { StatusChip } from "@/components/subdomain/StatusChip"
import { WebsiteFavicon } from "./WebsiteFavicon"

/** Width of the preview card, and of the desktop window the portal is laid out in before zooming down. */
export const PREVIEW_CARD_WIDTH = 640
const VIEWPORT_WIDTH = 1120
/** Height of the page below the header, so every step fills the same window and longer pages run off the bottom. */
const PAGE_HEIGHT = 800

/** New workspaces start on the blue brand colour (`getBrandingBySlug`'s fallback). */
export const PREVIEW_BRAND_PRIMARY = "#4d96e8"

/** Portal container gutter at that width (`Container`'s `lg:px-16`). */
const gutter = "px-16"

const SAMPLE_POSTS = [
  { title: "Dark mode for the dashboard", body: "It would be great to switch the whole dashboard to a dark theme for late-night work.", votes: 128, status: "planned", board: "Features", comments: 12, author: "Maya Chen", when: "2d ago" },
  { title: "Slack notifications", body: "Post a message to our team channel whenever a new request comes in.", votes: 96, status: "progress", board: "Features", comments: 8, author: "Leo Park", when: "4d ago" },
  { title: "Export data to CSV", body: "We need to pull all requests into a spreadsheet for our quarterly review.", votes: 71, status: "review", board: "Bugs", comments: 4, author: "Sam Ortiz", when: "Sep 5" },
  { title: "Two-factor login", body: "Let us require an authenticator app for everyone on the team.", votes: 54, status: "completed", board: "Features", comments: 6, author: "Ava Brooks", when: "Sep 2" },
  { title: "Search breaks on special characters", body: "Typing a # or & into search returns nothing, even for posts that contain them.", votes: 23, status: "pending", board: "Bugs", comments: 2, author: "Noah Kim", when: "Aug 28" },
]

const BOARD_ROWS = [
  { name: "Bugs", count: 112, dot: "bg-sky-500" },
  { name: "Features", count: 183, dot: "bg-emerald-500" },
]

const STATUS_ROWS = [
  { status: "pending", label: "Pending", count: 64 },
  { status: "review", label: "In review", count: 41 },
  { status: "planned", label: "Planned", count: 38 },
  { status: "progress", label: "In progress", count: 22 },
  { status: "completed", label: "Completed", count: 117 },
  { status: "closed", label: "Closed", count: 13 },
]

const HELP_TOPICS = [
  { name: "Getting started", icon: "bolt", count: 4 },
  { name: "Account and billing", icon: "card", count: 3 },
  { name: "Integrations", icon: "puzzle", count: 2 },
]

const HELP_POPULAR = [
  { title: "Post your first idea", summary: "Where to click, what makes a good title, and what happens after you post.", topic: "Getting started" },
  { title: "How voting works", summary: "One vote per person, and what the team does with the totals.", topic: "Getting started" },
  { title: "Sign in with a magic link", summary: "Get a one-time code by email instead of using a password.", topic: "Account and billing" },
  { title: "Connect Slack", summary: "Get a message in your channel whenever a new request comes in.", topic: "Integrations" },
]

/**
 * Lays its children out in a desktop-width window and zooms them down to the card, so the copies
 * below can use the portal's own desktop classes and sizes. Responsive variants follow the real
 * viewport, not this one, so the copies spell out the desktop values instead.
 */
export function DesktopViewport({
  children,
  className,
  page = false,
}: {
  children: React.ReactNode
  className?: string
  /** The page under the header: fixed window height, overflow clipped. */
  page?: boolean
}) {
  return (
    <div
      style={{
        width: VIEWPORT_WIDTH,
        height: page ? PAGE_HEIGHT : undefined,
        zoom: PREVIEW_CARD_WIDTH / VIEWPORT_WIDTH,
      }}
      className={cn(page && "overflow-hidden", className)}
    >
      {children}
    </div>
  )
}

/** Signed-out desktop `DomainHeader`. */
export function PortalHeaderPreview({
  domain,
  name,
  active,
}: {
  domain: string
  name: string
  active: "Feedback" | "Help"
}) {
  return (
    <header className="relative z-20 border-b border-border/60 bg-background/85 backdrop-blur-md dark:border-white/[0.07]">
      <div className={cn("flex h-14 w-full items-center gap-6", gutter)}>
        <span className="flex min-w-0 items-center gap-2.5">
          {domain.trim() ? (
            <WebsiteFavicon domain={domain} className="size-8 rounded-lg object-cover" />
          ) : (
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              {name[0]?.toUpperCase()}
            </span>
          )}
          <span className="truncate text-[15px] font-semibold tracking-tight">{name}</span>
        </span>
        <nav className="flex h-full items-center">
          {(["Feedback", "Roadmap", "Changelog", "Help"] as const).map((tab) => (
            <span
              key={tab}
              className={cn(
                navLinkClass,
                tab === active ? "text-foreground after:opacity-100" : "text-muted-foreground",
              )}
            >
              {tab}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            asChild
            variant="card"
            size="icon-sm"
            className={cn(raisedSurfaceClass, "h-8.5 w-56 justify-start gap-2.5 px-3.5 text-sm font-normal text-muted-foreground")}
          >
            <span>
              <SearchIcon className="size-4" size={16} />
              <span className="min-w-0 truncate text-left font-normal text-muted-foreground">Search feedback…</span>
              <span className="ml-auto inline-flex shrink-0 items-center gap-1">
                <ShortcutKey>⌘</ShortcutKey>
                <ShortcutKey>K</ShortcutKey>
              </span>
            </span>
          </Button>
          <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground dark:bg-transparent">
            <span>
              <MoonIcon className="size-4 dark:hidden" />
              <SunIcon className="hidden size-4 dark:block" />
            </span>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-muted-foreground dark:bg-transparent">
            <span>Sign in</span>
          </Button>
          <Button asChild size="sm" className="px-3">
            <span>Sign up</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

/** Desktop feedback home (`SubdomainListLayout`): heading, sort links, post rows, and the rail. */
export function FeedbackHomePreview({ name }: { name: string }) {
  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_236px] items-start gap-10 py-8", gutter)}>
      <div className="flex min-w-0 flex-col">
        <div className="mb-5 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Feedback</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share ideas, vote on what matters to you, and follow along as {name} builds.
          </p>
        </div>
        <div className="mb-2 flex items-center gap-4">
          {["Top", "New", "Oldest"].map((sort) => (
            <span
              key={sort}
              className={cn("py-1 text-sm", sort === "Top" ? "font-semibold text-foreground" : "text-muted-foreground")}
            >
              {sort}
            </span>
          ))}
        </div>
        <div className="divide-y divide-border/60 border-t border-border/60 dark:divide-white/[0.07] dark:border-white/[0.07]">
          {SAMPLE_POSTS.map((post) => (
            <article key={post.title} className="flex gap-5 px-3 py-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold leading-snug text-foreground">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <StatusChip status={post.status} />
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-muted-foreground/50">·</span>
                    <span className="truncate">{post.board}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <CommentsIcon aria-hidden className="size-3.5" />
                    {post.comments}
                  </span>
                  <span className="ml-auto inline-flex min-w-0 items-center gap-1.5">
                    <Avatar className="size-5">
                      <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">
                        {post.author.split(" ").map((part) => part[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[140px] truncate font-medium text-foreground/80">{post.author}</span>
                    <span className="text-muted-foreground/70">· {post.when}</span>
                  </span>
                </div>
              </div>
              {/* `UpvoteButton`, vertical and not yet voted. */}
              <span
                className={cn(
                  raisedSurfaceClass,
                  "inline-flex h-12 w-11 shrink-0 flex-col items-center justify-center gap-0.5 self-start rounded-lg px-0 text-[13px] text-muted-foreground",
                )}
              >
                <ArrowBigUp className="h-3.5 w-3.5" fill="none" />
                <span className="font-medium tabular-nums">{post.votes}</span>
              </span>
            </article>
          ))}
        </div>
      </div>

      <aside className="min-w-0 pt-1">
        <div className="min-w-0 space-y-6">
          <Button asChild className="w-full gap-2 px-3">
            <span>
              <IdeaIcon className="size-4" />
              Share an idea
            </span>
          </Button>
          <RailGroup title="Boards" icon={<BoardIcon className="size-3.5" />}>
            <RailRow active leading={<span className="size-2 rounded-full bg-current opacity-70" />} label="All feedback" count={295} />
            {BOARD_ROWS.map((row) => (
              <RailRow key={row.name} leading={<span className={cn("size-2 rounded-full", row.dot)} />} label={row.name} count={row.count} />
            ))}
          </RailGroup>
          <RailGroup title="Status" icon={<RoadmapIcon className="size-3.5" />}>
            {STATUS_ROWS.map((row) => (
              <RailRow key={row.status} leading={<StatusIcon status={row.status} className="size-4" />} label={row.label} count={row.count} />
            ))}
          </RailGroup>
          <RailGroup title="Updates" icon={<ChangelogIcon className="size-3.5" />}>
            <RailRow leading={<ChangelogIcon className="size-4" />} label="Changelog" count={0} />
            <RailRow leading={<RssIcon className="size-4" />} label="RSS feed" />
          </RailGroup>
          <div className="flex justify-start px-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Powered by</span>
              <FeatulLogoIcon className="size-3.5 shrink-0" size={14} />
              <span className="font-medium text-foreground/80">featul</span>
            </span>
          </div>
        </div>
      </aside>
    </div>
  )
}

/** `DomainSidebar` group heading over its rows. */
function RailGroup({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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

function RailRow({
  active,
  leading,
  label,
  count,
}: {
  active?: boolean
  leading: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm",
        active ? "bg-sidebar-accent font-medium text-foreground dark:bg-white/[0.07]" : "text-muted-foreground",
      )}
    >
      <span className={cn("flex size-4 shrink-0 items-center justify-center", active && "text-primary")}>{leading}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === "number" ? (
        <span className={cn("ml-auto text-xs tabular-nums", active ? "text-foreground/70" : "text-muted-foreground/70")}>
          {count}
        </span>
      ) : null}
    </li>
  )
}

/** Desktop `HelpHome` with sample topics and articles: hero, topic tiles, numbered popular articles. */
export function HelpHomePreview({ name }: { name: string }) {
  return (
    <div className={cn("flex flex-col gap-14 pb-12 pt-18", gutter)}>
      <header className="relative isolate z-10 pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-[26rem]"
          style={{ maskImage: "radial-gradient(ellipse 55% 75% at 50% 0%, black 0%, rgba(0,0,0,0.3) 45%, transparent 75%)" }}
        >
          <DitherGradient to="primary" direction="down" cell={4} opacity={0.28} />
        </div>
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">Help center</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.1] tracking-tight text-foreground">How can we help?</h1>
          <p className="mt-4 text-[15px] text-muted-foreground">Guides and answers from the {name} team.</p>
          <div className={cn(settingsSectionClass, "mt-9 w-full text-left")}>
            <div className={settingsSurfaceHeaderClass}>
              <div className="flex min-w-0 items-center gap-2.5">
                <SearchIcon className="size-4 shrink-0 text-primary" />
                <span className="text-sm font-medium leading-6 text-foreground">Search articles</span>
              </div>
            </div>
            <div className={cn(modalCardInnerClass, "flex h-12 items-center px-4 text-[15px] text-muted-foreground")}>
              Type a keyword
            </div>
          </div>
        </div>
      </header>

      <div>
        <SectionHeading title="Browse by topic" hint={`${HELP_TOPICS.length} topics`} />
        <ul className="grid grid-cols-5 gap-3">
          {HELP_TOPICS.map((topic) => (
            <li key={topic.name} className="flex">
              <span className={cn(modalCardShellClass, "flex w-full")}>
                <span className={cn(modalCardInnerClass, "flex flex-1 flex-col p-4")}>
                  <HelpCollectionTile icon={topic.icon} />
                  <span className="mt-6 line-clamp-2 text-sm font-medium leading-5 text-foreground">{topic.name}</span>
                  <span className="mt-1 text-xs tabular-nums text-muted-foreground">{topic.count} articles</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <SectionHeading title="Popular articles" />
        <ol className="grid grid-cols-2 gap-x-12">
          {HELP_POPULAR.map((article, i) => (
            <li key={article.title} className="min-w-0 border-t border-border/70 dark:border-white/[0.08]">
              <span className="flex items-start gap-4 py-4.5">
                <span className="mt-[1.375rem] w-5 shrink-0 text-xs leading-5 tabular-nums text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 block h-4 truncate text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-primary/80">
                    {article.topic}
                  </span>
                  <span className="line-clamp-1 text-[15px] font-medium leading-6 text-foreground">{article.title}</span>
                  <span className="mt-0.5 line-clamp-1 text-sm leading-5 text-muted-foreground">{article.summary}</span>
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {hint ? <span className="text-xs tabular-nums text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

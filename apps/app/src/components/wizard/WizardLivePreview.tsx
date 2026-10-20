"use client"

import React from "react"
import { DitherGradient } from "@featul/ui/components/gradient"
import { cn } from "@featul/ui/lib/utils"
import {
  ArrowBigUp,
  ArticleIcon,
  BookIcon,
  CollectIcon,
  LockIcon,
  SearchIcon,
} from "@/components/global/icons"
import StatusIcon from "@/components/requests/StatusIcon"
import { hostFromDomain } from "@/utils/domain"
import { WebsiteFavicon } from "./WebsiteFavicon"
import type { WizardStepId } from "./steps"

const SAMPLE_POSTS = [
  { title: "Dark mode for the dashboard", body: "It would be great to switch the whole dashboard to a dark theme for late-night work.", votes: 128, status: "planned", label: "Planned", tone: "text-amber-600", board: "Features", comments: 12 },
  { title: "Slack notifications", body: "Post a message to our team channel whenever a new request comes in.", votes: 96, status: "progress", label: "In progress", tone: "text-blue-600", board: "Features", comments: 8 },
  { title: "Export data to CSV", body: "We need to pull all requests into a spreadsheet for our quarterly review.", votes: 71, status: "review", label: "In review", tone: "text-violet-600", board: "Features", comments: 4 },
]

const BOARD_ROWS = [
  { name: "All feedback", count: 295, dot: "bg-primary/60", active: true },
  { name: "Bugs", count: 112, dot: "bg-sky-500" },
  { name: "Features", count: 183, dot: "bg-emerald-500" },
]

const STATUS_ROWS = [
  { status: "pending", label: "Pending", count: 64 },
  { status: "review", label: "In review", count: 41 },
  { status: "planned", label: "Planned", count: 38 },
  { status: "progress", label: "In progress", count: 22 },
]

const HELP_TOPICS = [
  { title: "Getting started", articles: ["Create your account", "Invite your team"] },
  { title: "Plans & billing", articles: ["Compare plans", "Change your plan"] },
]

/** How much of the panel the preview fills, across and down. */
const FILL_WIDTH = 0.94
const FILL_HEIGHT = 0.9

/**
 * Scale that fits `card` inside `frame`. The card is laid out at its natural size and scaled
 * as a whole, so its type and spacing stay in proportion at any panel size.
 */
function useFitScale(
  frame: React.RefObject<HTMLDivElement | null>,
  card: React.RefObject<HTMLDivElement | null>,
) {
  const [scale, setScale] = React.useState<number | null>(null)
  React.useLayoutEffect(() => {
    const frameEl = frame.current
    const cardEl = card.current
    if (!frameEl || !cardEl) return
    const fit = () => {
      if (!frameEl.clientWidth || !cardEl.offsetWidth) return
      setScale(
        Math.min(
          (frameEl.clientWidth * FILL_WIDTH) / cardEl.offsetWidth,
          (frameEl.clientHeight * FILL_HEIGHT) / cardEl.offsetHeight,
        ),
      )
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frameEl)
    observer.observe(cardEl)
    return () => observer.disconnect()
  }, [frame, card])
  return scale
}

/**
 * Right-hand preview for workspace setup: a copy of the public portal, scaled up to fill the panel
 * (the same header, board list and sidebar as `{slug}.featul.com`), filled in as the user types.
 * The last step shows the help center home instead.
 */
export default function WizardLivePreview({
  step,
  domain,
  name,
  slug,
  draftHelp,
}: {
  step: WizardStepId
  domain: string
  name: string
  slug: string
  timezone?: string
  now?: Date
  draftHelp: boolean
}) {
  const host = hostFromDomain(domain)
  const displayName =
    name.trim() || (host ? host.split(".")[0]!.replace(/^\w/, (c) => c.toUpperCase()) : "Your product")
  const subdomain = slug.trim() || "your-workspace"
  const showHelp = step === "help" && draftHelp
  const frameRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const scale = useFitScale(frameRef, cardRef)

  return (
    <div
      ref={frameRef}
      className="relative hidden min-h-0 overflow-hidden rounded-lg bg-primary lg:flex lg:h-full lg:items-center lg:justify-center"
    >
      <DitherGradient to="primary" direction="right" cell={3} />
      <div
        ref={cardRef}
        // Hidden until measured, so it doesn't flash at its natural size first.
        style={{ transform: `scale(${scale ?? 1})`, visibility: scale ? undefined : "hidden" }}
        className="relative w-[640px] shrink-0 overflow-hidden rounded-xl border border-black/10 bg-background shadow-2xl shadow-black/25"
      >
        {/* Address bar */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-muted/50 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-[50%] bg-border" />
            <span className="size-2.5 rounded-[50%] bg-border" />
            <span className="size-2.5 rounded-[50%] bg-border" />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[10px] text-muted-foreground">
            <LockIcon className="size-2.5 shrink-0" />
            <span className="truncate">
              {subdomain}.featul.com{showHelp ? "/help" : ""}
            </span>
          </span>
        </div>

        {/* Portal header, as on the subdomain */}
        <header className="flex items-center gap-4 border-b border-border/60 px-4 py-2.5">
          <span className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center overflow-hidden rounded-[50%]">
              <WebsiteFavicon domain={domain} className="size-5 rounded-[50%]" />
            </span>
            <span className="max-w-28 truncate text-[12px] font-semibold text-foreground">{displayName}</span>
          </span>
          <nav className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {["Feedback", "Roadmap", "Changelog", "Help"].map((tab) => {
              const active = showHelp ? tab === "Help" : tab === "Feedback"
              return (
                <span
                  key={tab}
                  className={cn("relative py-1", active && "font-medium text-foreground")}
                >
                  {tab}
                  {active ? <span className="absolute inset-x-0 -bottom-2.5 h-0.5 bg-primary" /> : null}
                </span>
              )
            })}
          </nav>
          <span className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-md border border-border/70 px-2 py-1 text-[9px] text-muted-foreground xl:flex">
              <SearchIcon className="size-2.5" />
              Search feedback…
            </span>
            <span className="text-[9px] text-muted-foreground">Sign in</span>
            <span className="rounded-md bg-primary px-2 py-1 text-[9px] font-medium text-primary-foreground">Sign up</span>
          </span>
        </header>

        {showHelp ? (
          <div key="help" className="px-5 pb-6 pt-6 animate-in fade-in-0 duration-300">
            <div className="text-center">
              <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-primary">Help center</p>
              <p className="mt-1.5 text-lg font-semibold tracking-tight text-foreground">How can we help?</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Guides and answers from the {displayName} team.</p>
              <div className="mx-auto mt-3 flex max-w-64 items-center gap-1.5 rounded-md border border-border/70 bg-card px-2.5 py-1.5 text-left text-[9px] text-muted-foreground">
                <SearchIcon className="size-2.5" />
                Search articles
              </div>
            </div>
            <p className="mt-5 text-[10px] font-semibold text-foreground">Browse by topic</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {HELP_TOPICS.map((topic) => (
                <div key={topic.title} className="rounded-lg border border-border/70 bg-card p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-md border border-border/70 text-primary">
                      <BookIcon className="size-2.5" />
                    </span>
                    <span>
                      <span className="block text-[10px] font-semibold text-foreground">{topic.title}</span>
                      <span className="block text-[8px] text-muted-foreground">{topic.articles.length} articles</span>
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
                    {topic.articles.map((article) => (
                      <li key={article} className="flex items-center gap-1.5 text-[9px] text-foreground/80">
                        <ArticleIcon className="size-2.5 text-muted-foreground" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div key="feedback" className="grid grid-cols-[minmax(0,1fr)_9.5rem] gap-4 px-4 pb-4 pt-4">
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-tight text-foreground">Feedback</p>
              <p className="mt-0.5 line-clamp-1 text-[9px] text-muted-foreground">
                Share ideas, vote on what matters to you, and follow along as {displayName} builds.
              </p>
              <div className="mt-2.5 flex gap-2.5 text-[9px] text-muted-foreground">
                <span className="font-semibold text-foreground">Top</span>
                <span>New</span>
                <span>Oldest</span>
              </div>
              <ul className="mt-1.5 divide-y divide-border/60">
                {SAMPLE_POSTS.map((post) => (
                  <li key={post.title} className="flex gap-2.5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-semibold text-foreground">{post.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-[9px] text-muted-foreground">{post.body}</p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[8px] text-muted-foreground">
                        <StatusIcon status={post.status} className="size-2.5" />
                        <span className={cn("font-medium", post.tone)}>{post.label}</span>
                        <span>· {post.board}</span>
                        <span className="flex items-center gap-0.5">
                          <CollectIcon className="size-2.5" />
                          {post.comments}
                        </span>
                      </p>
                    </div>
                    <span className="flex h-9 w-7 shrink-0 flex-col items-center justify-center rounded-md border border-border/70 text-[9px] font-medium tabular-nums text-foreground">
                      <ArrowBigUp className="size-2.5" />
                      {post.votes}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="space-y-3">
              <span className="block rounded-md bg-primary py-1.5 text-center text-[9px] font-medium text-primary-foreground">
                Share an idea
              </span>
              <div>
                <p className="px-1 text-[7px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Boards</p>
                <ul className="mt-1 space-y-0.5">
                  {BOARD_ROWS.map((row) => (
                    <li
                      key={row.name}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[9px] text-foreground/80",
                        row.active && "bg-muted font-medium text-foreground",
                      )}
                    >
                      <span className={cn("size-1.5 rounded-[50%]", row.dot)} />
                      <span className="flex-1 truncate">{row.name}</span>
                      <span className="tabular-nums text-muted-foreground">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="px-1 text-[7px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Status</p>
                <ul className="mt-1 space-y-0.5">
                  {STATUS_ROWS.map((row) => (
                    <li key={row.label} className="flex items-center gap-1.5 px-1.5 py-1 text-[9px] text-foreground/80">
                      <StatusIcon status={row.status} className="size-2.5" />
                      <span className="flex-1 truncate">{row.label}</span>
                      <span className="tabular-nums text-muted-foreground">{row.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}

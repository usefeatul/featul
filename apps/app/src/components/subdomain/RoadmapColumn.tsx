"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CommentsIcon } from "@/components/global/icons"
import StatusIcon from "@/components/requests/StatusIcon"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import type { RequestItemData } from "@/types/request"
import { statusHref } from "./DomainSidebar"

export type RoadmapColumnStatus = "planned" | "progress" | "completed"

const COLUMN_META: Record<RoadmapColumnStatus, { label: string; hint: string }> = {
  planned: { label: "Planned", hint: "Committed, not started yet" },
  progress: { label: "In progress", hint: "Being built right now" },
  completed: { label: "Completed", hint: "Recently shipped" },
}

/** Strip HTML tags. Collapse whitespace. Empty in → empty out. */
function toPlain(s?: string | null): string {
  if (!s) return ""
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

/** Accent rule under each column heading, matching the status icon fills. */
const ACCENT: Record<RoadmapColumnStatus, string> = {
  planned: "bg-[#f59e0b]",
  progress: "bg-[#4d96e8]",
  completed: "bg-[#15CF59]",
}

/** Plain roadmap column: heading over a coloured rule, then hairline-divided rows. */
export function RoadmapColumn({
  status,
  items,
  totalCount,
}: {
  status: RoadmapColumnStatus
  items: RequestItemData[]
  totalCount: number
}) {
  const meta = COLUMN_META[status]
  const overflow = Math.max(totalCount - items.length, 0)

  return (
    <section aria-labelledby={`roadmap-${status}`} className="flex min-w-0 flex-col">
      <header className="pb-3">
        <h2 id={`roadmap-${status}`} className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <StatusIcon status={status} className="size-4" />
          {meta.label}
          <span className="ml-auto text-xs font-medium tabular-nums text-muted-foreground">{totalCount}</span>
        </h2>
        <p className="mt-0.5 pl-6 text-xs text-muted-foreground">{meta.hint}</p>
      </header>
      <div className="relative h-px bg-border/60 dark:bg-white/[0.07]">
        <span aria-hidden className={`absolute left-0 top-1/2 h-0.5 w-10 -translate-y-1/2 rounded-full ${ACCENT[status]}`} />
      </div>

      <ol className="divide-y divide-border/60 dark:divide-white/[0.07]">
        {items.length === 0 ? (
          <li className="py-10 text-center text-sm text-muted-foreground/80">Nothing here yet.</li>
        ) : (
          items.map((item) => {
            const excerpt = toPlain(item.content)
            return (
              <li key={item.id} className="group relative flex gap-3 py-4">
                <Link
                  href={`/board/p/${item.slug}?from=roadmap`}
                  className="absolute inset-0 focus:outline-none"
                  aria-label={item.title}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  {excerpt ? (
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{excerpt}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {item.boardName ? <span className="truncate">{item.boardName}</span> : null}
                    {item.boardName ? <span className="text-muted-foreground/50">·</span> : null}
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <CommentsIcon className="size-3.5" aria-hidden />
                      {item.commentCount}
                    </span>
                  </div>
                </div>
                <div className="relative z-10 shrink-0 self-start">
                  <UpvoteButton
                    postId={item.id}
                    upvotes={item.upvotes}
                    hasVoted={item.hasVoted}
                    orientation="vertical"
                    className="h-10 w-9 text-xs"
                  />
                </div>
              </li>
            )
          })
        )}
        {overflow > 0 ? (
          <li className="py-2">
            <Link
              href={statusHref("/", status)}
              className="inline-flex items-center gap-1 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View {overflow} more
              <ArrowRight className="size-3.5" />
            </Link>
          </li>
        ) : null}
      </ol>
    </section>
  )
}

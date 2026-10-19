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
    <section
      aria-labelledby={`roadmap-${status}`}
      className="flex min-w-0 flex-col rounded-xl border border-border/60 bg-sidebar/60 dark:border-white/[0.07] dark:bg-white/[0.02]"
    >
      <header className="flex items-center gap-2.5 px-4 pt-3.5 pb-3">
        <div className="min-w-0 flex-1">
          <h2 id={`roadmap-${status}`} className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <StatusIcon status={status} className="size-4" />
            {meta.label}
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground dark:bg-white/[0.06]">
              {totalCount}
            </span>
          </h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta.hint}</p>
        </div>
      </header>

      <ol className="flex flex-col gap-2 px-2 pb-2">
        {items.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-xs text-muted-foreground dark:border-white/[0.08]">
            Nothing here yet.
          </li>
        ) : (
          items.map((item) => {
            const excerpt = toPlain(item.content)
            return (
              <li
                key={item.id}
                className="group relative flex gap-3 rounded-lg border border-border/60 bg-card p-3 transition-colors hover:border-primary/40 dark:border-white/[0.07] dark:bg-card"
              >
                <Link
                  href={`/board/p/${item.slug}?from=roadmap`}
                  className="absolute inset-0 rounded-lg focus:outline-none"
                  aria-label={item.title}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                    {item.title}
                  </h3>
                  {excerpt ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{excerpt}</p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {item.boardName ? <span className="truncate">{item.boardName}</span> : null}
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <CommentsIcon className="size-3" aria-hidden />
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
          <li>
            <Link
              href={statusHref("/", status)}
              className="flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
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

"use client"

import React from "react"
import Link from "next/link"
import StatusIcon from "@/components/requests/StatusIcon"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"
import type { MemberTopPost } from "@/lib/team"

interface MemberTopPostsProps {
  slug: string
  topPosts: MemberTopPost[]
  isLoading?: boolean
  className?: string
  panel?: boolean
}

export function MemberTopPosts({ slug, topPosts, isLoading, className, panel = false }: MemberTopPostsProps) {
  const hasPosts = topPosts.length > 0
  const displayedPosts = topPosts.slice(0, 5)

  return (
    <section className={cn("w-full min-w-0", panel && "flex min-h-0 flex-1 flex-col", className)}>
      <header className={cn(
        "flex justify-between gap-2",
        panel
          ? "shrink-0 items-center border-b border-border/60 px-4 py-4 dark:border-white/10"
          : "min-h-9 items-start border-b border-border/30 pb-3 dark:border-white/5",
      )}>
        <div className="min-w-0">
          <h2 className={cn("font-semibold text-foreground", panel ? "text-sm" : "text-base")}>
            Top posts
          </h2>
          <p className="mt-1 text-xs text-accent">Ranked by upvotes</p>
        </div>
        {hasPosts ? (
          <div className="flex shrink-0 items-center">
            <Button asChild variant="plain" size="xs" className="px-2.5 text-xs">
              <Link href={`/workspaces/${slug}/requests`}>View all</Link>
            </Button>
          </div>
        ) : null}
      </header>
      <div className={cn(panel ? "scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain" : "overflow-hidden")}>
        {isLoading && !hasPosts ? (
          <div className="px-4 py-8">
            <LoadingSpinner label="Loading top posts..." />
          </div>
        ) : !hasPosts ? (
          <div className="px-4 py-8 text-center text-sm text-accent">
            No posts yet
          </div>
        ) : (
          <ol className="m-0 list-none p-0">
            {displayedPosts.map((p, index) => (
              <li key={p.id} className="border-b border-border/60 dark:border-white/10">
                <div className="flex min-h-20 items-center gap-3 px-4 py-4 transition-colors hover:bg-black/[0.06] focus-within:bg-black/[0.06] dark:hover:bg-white/[0.03] dark:focus-within:bg-white/[0.03]">
                  <Link
                    href={`/workspaces/${slug}/requests/${p.slug}`}
                    className="flex min-w-0 flex-1 items-start gap-2 rounded-sm text-sm font-medium leading-5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title={p.title}
                  >
                    <span aria-hidden="true" className="mr-1 w-4 shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {p.status ? (
                      <StatusIcon status={String(p.status)} className="mt-px size-[18px] shrink-0" />
                    ) : null}
                    <span className="line-clamp-2 break-words">{p.title}</span>
                  </Link>
                  <UpvoteButton
                    postId={p.id}
                    upvotes={Number(p.upvotes || 0)}
                    className="min-h-8 min-w-14 shrink-0 justify-center rounded-md border border-border/60 px-2 text-xs tabular-nums hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:hover:bg-white/[0.03]"
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

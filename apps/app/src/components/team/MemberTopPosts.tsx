"use client"

import React from "react"
import Link from "next/link"
import StatusIcon from "@/components/requests/StatusIcon"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"
import type { MemberTopPost } from "@/lib/team"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

interface MemberTopPostsProps {
  slug: string
  topPosts: MemberTopPost[]
  isLoading?: boolean
  className?: string
}

export function MemberTopPosts({ slug, topPosts, isLoading, className }: MemberTopPostsProps) {
  const hasPosts = topPosts.length > 0
  const displayedPosts = topPosts.slice(0, 5)

  return (
    <section className={cn(settingsCardShellClass, className)}>
      <header className="flex flex-col gap-2 py-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="mt-0.5 text-sm font-medium leading-none text-foreground">
            Top posts
          </h2>
          <p className="mt-1 text-xs text-accent">Ranked by upvotes</p>
        </div>
        {hasPosts ? (
          <div className="flex w-full shrink-0 items-center justify-end sm:w-auto sm:pl-4">
            <Button asChild variant="plain" size="xs" className="px-2.5 text-xs">
              <Link href={`/workspaces/${slug}/requests`}>View all</Link>
            </Button>
          </div>
        ) : null}
      </header>
      <div className={cn(settingsCardInnerClass, "overflow-hidden p-0")}>
        {isLoading && !hasPosts ? (
          <div className="px-4 py-8">
            <LoadingSpinner label="Loading top posts..." />
          </div>
        ) : !hasPosts ? (
          <div className="px-4 py-8 text-center text-sm text-accent">
            No posts yet
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {displayedPosts.map((p) => (
              <li
                key={p.id}
                className="border-b border-border/60 last:border-b-0 dark:border-b-white/10"
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors hover:bg-muted/40">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {p.status ? (
                      <StatusIcon status={String(p.status)} className="size-3.5 shrink-0" />
                    ) : null}
                    <Link
                      href={`/workspaces/${slug}/requests/${p.slug}`}
                      className="min-w-0 flex-1 truncate text-foreground hover:text-primary"
                      title={p.title}
                    >
                      {p.title}
                    </Link>
                  </div>
                  <UpvoteButton
                    postId={p.id}
                    upvotes={Number(p.upvotes || 0)}
                    className="shrink-0 text-xs"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

"use client"

import React from "react"
import Link from "next/link"
import StatusIcon from "@/components/requests/StatusIcon"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { Button } from "@featul/ui/components/button"
import { cn } from "@featul/ui/lib/utils"

interface MemberTopPostsProps {
  slug: string
  topPosts: Array<{ id: string; title: string; slug: string; upvotes: number; status?: string | null }>
  isLoading?: boolean
  className?: string
}

export function MemberTopPosts({ slug, topPosts, isLoading, className }: MemberTopPostsProps) {
  const hasPosts = topPosts.length > 0
  const displayedPosts = topPosts.slice(0, 5)

  return (
    <div className={cn("space-y-3 w-full max-w-[310px] mx-auto lg:pl-0", className)}>
      <div>
        <div className="font-semibold">Top posts</div>
        <p className="mt-1 text-xs text-accent">Ranked by upvotes</p>
      </div>
      {isLoading && !hasPosts ? (
        <LoadingSpinner label="Loading top posts..." />
      ) : !hasPosts ? (
        <div className="flex items-center justify-center py-6 text-xs text-accent text-center">
          No posts yet
        </div>
      ) : (
        <div>
          {displayedPosts.map((p) => (
            <div key={p.id} className="border-t border-border/70 first:border-t-0">
              <div className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {p.status ? <StatusIcon status={String(p.status)} className="size-3.5 shrink-0" /> : null}
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
                  className="text-xs shrink-0"
                />
              </div>
            </div>
          ))}
          <div className="mt-2 border-t border-border/70 pt-3 flex justify-center">
            <Button asChild variant="nav" size="xs" className="rounded-md text-xs px-2.5">
              <Link href={`/workspaces/${slug}/requests`}>
                View all requests
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

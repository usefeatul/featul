"use client"

import React from "react"
import Link from "next/link"
import StatusIcon from "@/components/requests/StatusIcon"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"

interface MemberTopPostsProps {
  slug: string
  topPosts: Array<{ id: string; title: string; slug: string; upvotes: number; status?: string | null }>
  isLoading?: boolean
}

export function MemberTopPosts({ slug, topPosts, isLoading }: MemberTopPostsProps) {
  const hasPosts = topPosts.length > 0

  return (
    <div className="hidden lg:block space-y-3 lg:pl-4">
      <div className="font-semibold">Top posts</div>
      {isLoading && !hasPosts ? (
        <LoadingSpinner label="Loading top posts..." />
      ) : !hasPosts ? (
        <div className="flex items-center justify-center py-6 text-sm text-accent text-center">
          No posts yet
        </div>
      ) : (
        <div className="space-y-2">
          {topPosts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted text-sm gap-3"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {p.status ? <StatusIcon status={String(p.status)} className="size-3.5 shrink-0" /> : null}
                <Link
                  href={`/workspaces/${slug}/requests/${p.slug}`}
                  className="min-w-0 flex-1 truncate text-foreground hover:text-primary"
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
          ))}
        </div>
      )}
    </div>
  )
}

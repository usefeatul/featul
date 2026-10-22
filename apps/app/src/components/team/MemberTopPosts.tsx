"use client"

import { Mascot } from "@featul/ui/components/mascot"
import React from "react"
import Link from "next/link"
import StatusIcon from "@/components/requests/StatusIcon"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { LoadingSpinner } from "@/components/settings/global/LoadingSpinner"
import { Button } from "@featul/ui/components/button"
import SectionCard from "@/components/settings/global/SectionCard"
import type { MemberTopPost } from "@/lib/team"

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
    <SectionCard
      title="Top posts"
      className={className}
      contentClassName="p-0"
      action={hasPosts ? (
        <Button asChild variant="plain" size="xs" className="px-2.5 text-xs">
          <Link href={`/workspaces/${slug}/requests`}>View all</Link>
        </Button>
      ) : null}
    >
      {isLoading && !hasPosts ? (
        <div className="px-4 py-8">
          <LoadingSpinner label="Loading top posts..." />
        </div>
      ) : !hasPosts ? (
        <div className="flex flex-col items-center px-4 py-8 text-center text-sm text-accent">
          <Mascot size={64} className="mb-3" />
          No posts yet
        </div>
      ) : (
        <ol className="m-0 list-none divide-y divide-border/50 p-0">
          {displayedPosts.map((p, index) => (
            <li key={p.id}>
              <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-within:bg-muted/50">
                <Link
                  href={`/workspaces/${slug}/requests/${p.slug}`}
                  className="flex min-w-0 flex-1 items-start gap-2 rounded-lg text-sm font-medium leading-5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title={p.title}
                >
                  <span aria-hidden="true" className="mr-1 w-4 shrink-0 pt-px text-[11px] font-medium tabular-nums text-muted-foreground/70">
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
                  className="min-h-8 min-w-14 shrink-0 justify-center px-2 text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}

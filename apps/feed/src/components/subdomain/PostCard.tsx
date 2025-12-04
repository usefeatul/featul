"use client"

import React from "react"
import Link from "next/link"
import { UpvoteButton } from "@/components/global/UpvoteButton"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import type { RequestItemData } from "@/components/requests/RequestItem"
import StatusIcon from "@/components/requests/StatusIcon"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { randomAvatarUrl } from "@/utils/avatar"
import { statusLabel } from "@/lib/roadmap"
import RoleBadge from "@/components/comments/RoleBadge"

function toPlain(s?: string | null): string {
  if (!s) return ""
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function PostCardBase({ item, onVoteChange }: { item: RequestItemData; onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void }) {
  const href = `/p/${item.slug}`
  return (
    <div className="py-6 px-6">
      <div className="inline-flex items-center gap-2">
        <StatusIcon status={item.roadmapStatus || undefined} className="size-5 text-foreground/80" />
        <span className="text-sm text-accent">{statusLabel(String(item.roadmapStatus || "pending"))}</span>
      </div>
      <div className="mt-2">
        <Link href={href} className="text-lg font-semibold text-foreground hover:text-primary">
          {item.title}
        </Link>
      </div>
      {item.content ? (
        <p className="mt-3 text-sm text-accent break-words whitespace-normal line-clamp-2">{toPlain(item.content)}</p>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <div className="relative">
            <Avatar className="size-6 bg-background border border-border rounded-full relative overflow-visible">
              <AvatarImage src={!item.isAnonymous ? (item.authorImage || randomAvatarUrl(item.id || item.slug)) : randomAvatarUrl(item.id || item.slug)} alt={item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous")} />
              <AvatarFallback>{getInitials(item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous"))}</AvatarFallback>
              <RoleBadge role={item.role} isOwner={item.isOwner} />
            </Avatar>
          </div>
          <span className="text-xs text-accent whitespace-nowrap mt-2  max-w-[180px] truncate">
            {item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous")}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-accent">
          <div className="inline-flex items-center gap-2 ">
            <UpvoteButton
              postId={item.id}
              upvotes={item.upvotes}
              hasVoted={item.hasVoted}
              className="text-xs hover:text-red-500/80"
              activeBg
              onChange={(v) => onVoteChange?.(item.id, v.upvotes, v.hasVoted)}
            />
          </div>
          <Link href={href} aria-label="View comments" className="inline-flex items-center gap-1">
            <CommentsIcon aria-hidden className="size-4" />
            <span className="tabular-nums">{item.commentCount}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default React.memo(PostCardBase)

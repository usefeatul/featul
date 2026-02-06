"use client"

import React from "react"
import Link from "next/link"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { CommentsIcon } from "@featul/ui/icons/comments"
import type { RequestItemData } from "@/types/request"
import StatusIcon from "@/components/requests/StatusIcon"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user-utils"
import { statusLabel } from "@/lib/roadmap"
import RoleBadge from "@/components/global/RoleBadge"
import { FlagRibbon } from "@/components/global/FlagRibbon"

function toPlain(s?: string | null): string {
  if (!s) return ""
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function PostCardBase({
  item,
  onVoteChange,
  linkPrefix = "/p",
  hidePublicMemberIdentity = false
}: {
  item: RequestItemData;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
  linkPrefix?: string;
  hidePublicMemberIdentity?: boolean;
}) {
  const href = `${linkPrefix}/${item.slug}`

  // Determine display values based on hidePublicMemberIdentity setting
  const displayUser = getPrivacySafeDisplayUser(
    {
      name: item.authorName || "Guest",
      image: item.authorImage || undefined,
      email: ""
    },
    hidePublicMemberIdentity,
    item.id || item.slug // Fallback seed
  )

  const showHiddenIdentity = hidePublicMemberIdentity && !item.isAnonymous
  const displayName = displayUser.name
  const displayImage = displayUser.image

  return (
    <div className="py-6 px-6 relative group overflow-hidden transition-colors hover:bg-background dark:hover:bg-background">
      <FlagRibbon isPinned={item.isPinned} isFeatured={item.isFeatured} />
      <Link href={href} className="absolute inset-0 focus:outline-none" aria-label={item.title}>
        <span className="sr-only">View post</span>
      </Link>
      <div className="inline-flex items-center gap-2">
        <StatusIcon status={item.roadmapStatus || undefined} className="size-5 text-foreground/80" />
        <span className="text-sm text-accent">{statusLabel(String(item.roadmapStatus || "pending"))}</span>
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold text-foreground">
          {item.title}
        </h3>
      </div>
      {item.content ? (
        <p className="mt-3 text-sm text-accent  whitespace-normal line-clamp-2">{toPlain(item.content)}</p>
      ) : null}
      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="size-8 relative overflow-visible">
              <AvatarImage src={displayImage || undefined} alt={displayName} />
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">{getInitials(displayName)}</AvatarFallback>
              {!showHiddenIdentity && <RoleBadge role={item.role} isOwner={item.isOwner} isFeatul={item.isFeatul} className="bg-card" />}
            </Avatar>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground whitespace-nowrap max-w-[180px] truncate">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {new Date(item.publishedAt ?? item.createdAt ?? new Date()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-accent">
          <div className="inline-flex items-center gap-2 relative z-10">
            <UpvoteButton
              postId={item.id}
              upvotes={item.upvotes}
              hasVoted={item.hasVoted}
              className="text-xs hover:text-red-500/80"
              onChange={(v) => onVoteChange?.(item.id, v.upvotes, v.hasVoted)}
            />
          </div>
          <div className="inline-flex items-center gap-1">
            <CommentsIcon aria-hidden className="size-3.5" />
            <span className="tabular-nums">{item.commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(PostCardBase)

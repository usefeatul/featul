"use client"

import React from "react"
import Link from "next/link"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { CommentsIcon, PinIcon } from "@/components/global/icons"
import type { RequestItemData } from "@/types/request"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user"
import RoleBadge from "@/components/global/RoleBadge"
import { StatusChip } from "./StatusChip"
import { subdomainListItemClassName } from "./subdomainListItemStyles"

/** Locale-stable "3d ago" / "Sep 5" label so server and client markup agree. */
function postedLabel(value?: string | null): string {
  if (!value) return ""
  const past = new Date(value)
  const ts = past.getTime()
  if (Number.isNaN(ts)) return ""
  const days = Math.floor((Date.now() - ts) / 86_400_000)
  if (days < 1) return "today"
  if (days < 7) return `${days}d ago`
  const sameYear = past.getUTCFullYear() === new Date().getUTCFullYear()
  return past.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: "UTC",
  })
}

/** Strip HTML tags. Collapse whitespace. Empty in → empty out. */
function toPlain(s?: string | null): string {
  if (!s) return ""
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function PostCardBase({
  item,
  onVoteChange,
  linkPrefix = "/p",
  hidePublicMemberIdentity = false,
  showBoard = true,
}: {
  item: RequestItemData;
  onVoteChange?: (id: string, upvotes: number, hasVoted: boolean) => void;
  linkPrefix?: string;
  hidePublicMemberIdentity?: boolean;
  showBoard?: boolean;
}) {
  const href = `${linkPrefix}/${item.slug}`

  const displayUser = getPrivacySafeDisplayUser(
    {
      name: item.authorName || "Guest",
      image: item.authorImage || undefined,
      email: ""
    },
    hidePublicMemberIdentity,
    item.id || item.slug
  )

  const showHiddenIdentity = hidePublicMemberIdentity && !item.isAnonymous
  const displayName = displayUser.name
  const displayImage = displayUser.image
  const excerpt = toPlain(item.content)
  const when = postedLabel(item.publishedAt ?? item.createdAt)

  return (
    <article className={`${subdomainListItemClassName} group relative flex gap-4 overflow-hidden sm:gap-5`}>
      <Link href={href} className="absolute inset-0 focus:outline-none" aria-label={item.title}>
        <span className="sr-only">View post</span>
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="flex items-start gap-1.5 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {item.isPinned ? (
            <PinIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-label="Pinned" />
          ) : null}
          <span>{item.title}</span>
        </h3>
        {excerpt ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <StatusChip status={item.roadmapStatus} />
          {showBoard && item.boardName ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-muted-foreground/50">·</span>
              <span className="truncate">{item.boardName}</span>
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 tabular-nums">
            <CommentsIcon aria-hidden className="size-3.5" />
            {item.commentCount}
          </span>
          <span className="ml-auto inline-flex min-w-0 items-center gap-1.5">
            <Avatar className="relative size-5 overflow-visible">
              <AvatarImage src={displayImage || undefined} alt={displayName} />
              <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">{getInitials(displayName)}</AvatarFallback>
              {!showHiddenIdentity ? (
                <RoleBadge role={item.role} isOwner={item.isOwner} isFeatul={item.isFeatul} className="bg-card" />
              ) : null}
            </Avatar>
            <span className="max-w-[140px] truncate font-medium text-foreground/80">{displayName}</span>
            {when ? <span className="text-muted-foreground/70" suppressHydrationWarning>· {when}</span> : null}
          </span>
        </div>
      </div>

      <div className="relative z-10 shrink-0 self-start">
        <UpvoteButton
          postId={item.id}
          upvotes={item.upvotes}
          hasVoted={item.hasVoted}
          orientation="vertical"
          onChange={(v) => onVoteChange?.(item.id, v.upvotes, v.hasVoted)}
        />
      </div>
    </article>
  )
}

export default React.memo(PostCardBase)

"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import StatusIcon from "./StatusIcon"
import { CommentsIcon } from "@oreilla/ui/icons/comments"
import { Avatar, AvatarImage, AvatarFallback } from "@oreilla/ui/components/avatar"
import { Checkbox } from "@oreilla/ui/components/checkbox"
import { getInitials } from "@/utils/user-utils"
import { randomAvatarUrl } from "@/utils/avatar"
import RoleBadge from "@/components/global/RoleBadge"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"

export type RequestItemData = {
  id: string
  title: string
  slug: string
  content: string | null
  image: string | null
  commentCount: number
  upvotes: number
  roadmapStatus: string | null
  publishedAt: string | null
  createdAt: string
  boardSlug: string
  boardName: string
  authorImage?: string | null
  authorName?: string | null
  isAnonymous?: boolean
  hasVoted?: boolean
  role?: "admin" | "member" | "viewer" | null
  isOwner?: boolean
}

function RequestItemBase({
  item,
  workspaceSlug,
  linkBase,
  isSelecting,
  isSelected,
  onToggle,
  disableLink,
}: {
  item: RequestItemData
  workspaceSlug: string
  linkBase?: string
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (checked: boolean) => void
  disableLink?: boolean
}) {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const base = linkBase || `/workspaces/${workspaceSlug}`
  const href = `${base}/requests/${item.slug}${queryString}`
  const title = item.title || ""
  const displayTitle = title.length > 110 ? `${title.slice(0, 110).trimEnd()}…` : title
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/70 bg-card dark:bg-black/40 last:border-b-0">
      {isSelecting ? (
        <Checkbox
          checked={!!isSelected}
          onCheckedChange={(v) => onToggle?.(!!v)}
          aria-label="Select post"
          className="mr-1 cursor-pointer"
        />
      ) : null}
      <StatusIcon status={item.roadmapStatus || undefined} className="size-5 text-foreground/80" />
      <Link
        href={href}
        className={`flex-1 min-w-0 truncate text-sm font-medium ${disableLink ? "text-foreground/60 cursor-default" : "text-foreground hover:text-primary"}`}
        onClick={(e) => {
          if (disableLink) e.preventDefault()
        }}
        tabIndex={disableLink ? -1 : 0}
        aria-disabled={disableLink ? true : undefined}
      >
        {displayTitle}
      </Link>
      <div className="ml-auto flex items-center gap-3 text-xs text-accent">
        <div className="inline-flex items-center gap-2 relative z-10">
          <UpvoteButton postId={item.id} upvotes={item.upvotes} hasVoted={item.hasVoted} className="text-xs hover:text-red-500/80" activeBg />
        </div>
        <div className="inline-flex items-center gap-1">
          <CommentsIcon aria-hidden className="size-3.5" />
          <span className="tabular-nums">{item.commentCount}</span>
        </div>
        <span>{new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(new Date(item.publishedAt ?? item.createdAt))}</span>
        <div className="relative">
          <Avatar className="size-6 bg-muted ring-1 ring-border rounded-md relative overflow-visible">
            <AvatarImage src={item.authorImage || randomAvatarUrl(item.id || item.slug)} alt={item.isAnonymous ? "Guest" : (item.authorName || "Guest")} />
            <AvatarFallback>{getInitials(item.isAnonymous ? "Guest" : (item.authorName || "Guest"))}</AvatarFallback>
            <RoleBadge role={item.role} isOwner={item.isOwner} />
          </Avatar>
        </div>
      </div>
    </div>
  )
}

export default React.memo(RequestItemBase)

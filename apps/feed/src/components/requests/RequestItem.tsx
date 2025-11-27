"use client"

import React from "react"
import Link from "next/link"
import StatusIcon from "./StatusIcon"
import { LoveIcon } from "@feedgot/ui/icons/love"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"

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
}

function RequestItemBase({ item, workspaceSlug }: { item: RequestItemData; workspaceSlug: string }) {
  const href = `/workspaces/${workspaceSlug}/requests/${item.slug}`
  return (
    <li className="rounded-md border bg-card p-3">
      <div className="flex items-center gap-3">
        <StatusIcon status={item.roadmapStatus || undefined} className="w-[18px] h-[18px] text-foreground/80" />
        <Avatar className="size-6">
          <AvatarImage src={!item.isAnonymous && item.authorImage ? item.authorImage : ""} alt={item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous")} />
          <AvatarFallback>{getInitials(item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous"))}</AvatarFallback>
        </Avatar>
        <Link href={href} className="text-sm font-medium text-foreground hover:text-primary truncate flex-1">
          {item.title}
        </Link>
        <div className="ml-auto flex items-center gap-3 text-xs text-accent">
          <span className="inline-flex items-center gap-1.5">
            <LoveIcon aria-hidden className="w-4 h-4" />
            <span className="tabular-nums">{item.upvotes}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CommentsIcon aria-hidden className="w-4 h-4" />
            <span className="tabular-nums">{item.commentCount}</span>
          </span>
          <span>{new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(new Date(item.publishedAt ?? item.createdAt))}</span>
        </div>
      </div>
    </li>
  )
}

export default React.memo(RequestItemBase)

"use client"

import React from "react"
import Link from "next/link"
import StatusIcon from "./StatusIcon"
import { LoveIcon } from "@feedgot/ui/icons/love"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { randomAvatarUrl } from "@/utils/avatar"
import RoleBadge from "@/components/comments/RoleBadge"

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

function RequestItemBase({ item, workspaceSlug, linkBase }: { item: RequestItemData; workspaceSlug: string; linkBase?: string }) {
  const base = linkBase || `/workspaces/${workspaceSlug}`
  const href = `${base}/requests/${item.slug}`
  return (
    <div className="rounded-md border bg-card p-2.5">
      <div className="flex items-center bg-card gap-3">
        <StatusIcon status={item.roadmapStatus || undefined} className="w-[18px] h-[18px] text-foreground/80" />
        <Link href={href} className="text-sm font-medium text-foreground hover:text-primary truncate flex-1">
          {item.title}
        </Link>
        <div className="ml-auto flex items-center gap-3 text-xs text-accent">
          <div className="inline-flex items-center gap-2 bg-muted rounded-md ring-1 ring-border px-2 py-1">
            <span className="inline-flex items-center gap-1">
              <LoveIcon aria-hidden className="w-3 h-3" />
              <span className="tabular-nums">{item.upvotes}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CommentsIcon aria-hidden className="w-3 h-3" />
              <span className="tabular-nums">{item.commentCount}</span>
            </span>
          </div>
          <span>{new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(new Date(item.publishedAt ?? item.createdAt))}</span>
          <div className="relative">
            <Avatar className="size-6 bg-muted ring-1 ring-border rounded-md relative overflow-visible">
              <AvatarImage src={!item.isAnonymous ? (item.authorImage || randomAvatarUrl(item.id || item.slug)) : randomAvatarUrl(item.id || item.slug)} alt={item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous")} />
              <AvatarFallback>{getInitials(item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous"))}</AvatarFallback>
              <RoleBadge role={item.role} isOwner={item.isOwner} />
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(RequestItemBase)

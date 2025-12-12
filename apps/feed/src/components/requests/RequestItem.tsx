"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import StatusIcon from "./StatusIcon"
import { LoveIcon } from "@oreilla/ui/icons/love"
import { CommentsIcon } from "@oreilla/ui/icons/comments"
import { Avatar, AvatarImage, AvatarFallback } from "@oreilla/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { randomAvatarUrl } from "@/utils/avatar"
import RoleBadge from "@/components/comments/RoleBadge"
import { HeartIcon } from "lucide-react"

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
  const searchParams = useSearchParams()
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const base = linkBase || `/workspaces/${workspaceSlug}`
  const href = `${base}/requests/${item.slug}${queryString}`
  return (
    <div className="rounded-md border bg-card p-2.5">
      <div className="flex items-center bg-card gap-3">
        <StatusIcon status={item.roadmapStatus || undefined} className="size-5 text-foreground/80" />
        <Link href={href} className="text-sm font-medium text-foreground hover:text-primary truncate flex-1">
          {item.title}
        </Link>
        <div className="ml-auto flex items-center gap-3 text-xs text-accent">
          <div className="inline-flex items-center gap-2 bg-muted rounded-md ring-1 ring-border px-2 py-1">
            <span className="inline-flex items-center gap-1">
              {/* <LoveIcon  className="size-1" /> */}
              <HeartIcon className="size-3" />
              <span className="tabular-nums">{item.upvotes}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CommentsIcon className="size-3" />
              <span className="tabular-nums">{item.commentCount}</span>
            </span>
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
    </div>
  )
}

export default React.memo(RequestItemBase)

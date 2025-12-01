"use client"

import React from "react"
import Link from "next/link"
import { LoveIcon } from "@feedgot/ui/icons/love"
import { CommentsIcon } from "@feedgot/ui/icons/comments"
import type { RequestItemData } from "@/components/requests/RequestItem"
import StatusIcon from "@/components/requests/StatusIcon"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { randomAvatarUrl } from "@/utils/avatar"
import { statusLabel } from "@/lib/roadmap"

function toPlain(s?: string | null): string {
  if (!s) return ""
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function PostCardBase({ item, workspaceSlug, linkBase }: { item: RequestItemData; workspaceSlug: string; linkBase?: string }) {
  const base = linkBase || `/workspaces/${workspaceSlug}`
  const href = `${base}/requests/${item.slug}`
  return (
    <div className="py-6 px-6 min-h-[140px]">
      <div className="flex items-start gap-3">
        <Link href={href} className="text-lg font-semibold text-foreground hover:text-primary flex-1">
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
          <Avatar className="size-8 bg-muted ring-1 ring-border rounded-md">
            <AvatarImage src={!item.isAnonymous ? (item.authorImage || randomAvatarUrl(item.id || item.slug)) : randomAvatarUrl(item.id || item.slug)} alt={item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous")} />
            <AvatarFallback>{getInitials(item.isAnonymous ? "Anonymous" : (item.authorName || "Anonymous"))}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      {item.content ? (
        <p className="mt-3 text-sm text-accent break-words whitespace-normal line-clamp-2">{toPlain(item.content)}</p>
      ) : null}
      <div className="mt-3 inline-flex items-center gap-2">
        <StatusIcon status={item.roadmapStatus || undefined} className="w-[18px] h-[18px] text-foreground/80" />
        <span className="text-sm text-accent">{statusLabel(String(item.roadmapStatus || "pending"))}</span>
      </div>
    </div>
  )
}

export default React.memo(PostCardBase)

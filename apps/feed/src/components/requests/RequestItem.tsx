"use client"

import React from "react"
import Link from "next/link"
import StatusIcon from "./StatusIcon"

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
}

function RequestItemBase({ item, workspaceSlug }: { item: RequestItemData; workspaceSlug: string }) {
  const href = `/workspaces/${workspaceSlug}/requests/${item.slug}`
  return (
    <li className="rounded-md border bg-card p-3">
      <div className="flex items-start gap-3">
        {item.image ? <img src={item.image} alt="" className="w-16 h-16 rounded-md object-cover border" /> : null}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StatusIcon status={item.roadmapStatus || undefined} className="w-[18px] h-[18px] text-foreground/80" />
            <Link href={href} className="text-sm font-medium text-foreground hover:text-primary">
              {item.title}
            </Link>
          </div>
          <div className="text-xs text-accent mt-0.5">{item.boardName}</div>
          <div className="mt-2 flex items-center gap-3 text-xs text-accent">
            <span className="rounded-md bg-muted px-2 py-0.5">{item.roadmapStatus || "pending"}</span>
            <span>↑ {item.upvotes}</span>
            <span>💬 {item.commentCount}</span>
            <span>{new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(new Date(item.publishedAt ?? item.createdAt))}</span>
          </div>
        </div>
      </div>
    </li>
  )
}

export default React.memo(RequestItemBase)


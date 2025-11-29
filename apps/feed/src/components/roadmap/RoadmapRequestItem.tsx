"use client"

import React from "react"
import Link from "next/link"

export type RoadmapItemData = {
  id: string
  title: string
  slug: string
  roadmapStatus: string | null
  content?: string | null
}

function toPlain(s?: string | null): string {
  if (!s) return ""
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

export default function RoadmapRequestItem({ item, workspaceSlug }: { item: RoadmapItemData; workspaceSlug: string }) {
  const href = `/workspaces/${workspaceSlug}/requests/${item.slug}`
  return (
    <div className="flex flex-col w-full overflow-hidden min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <Link href={href} className="text-sm font-medium text-foreground hover:text-primary truncate min-w-0">
          {item.title}
        </Link>
      </div>
      {item.content ? (
        <p className="text-accent mt-1 text-xs break-words whitespace-normal line-clamp-2 max-w-full overflow-hidden">
          {toPlain(item.content)}
        </p>
      ) : null}
    </div>
  )
}

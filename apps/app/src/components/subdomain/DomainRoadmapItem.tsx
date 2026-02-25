"use client"

import Link from "next/link"
import StatusIcon from "@/components/requests/StatusIcon"
import { statusLabel } from "@/lib/roadmap"
import { subdomainListItemClassName } from "./subdomainListItemStyles"

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

export default function DomainRoadmapItem({ item }: { item: RoadmapItemData & { boardSlug?: string } }) {
  const href = item.boardSlug ? `/board/p/${item.slug}?from=roadmap` : `/p/${item.slug}?from=roadmap`
  return (
    <Link
      href={href}
      aria-label={item.title}
      className={`${subdomainListItemClassName} block min-h-[140px]`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg font-semibold text-foreground flex-1">
          {item.title}
        </span>
      </div>
      {item.content ? (
        <p className="mt-3 text-sm text-accent wrap-break-word whitespace-normal line-clamp-2">{toPlain(item.content)}</p>
      ) : null}
      <div className="mt-3 inline-flex items-center gap-2">
        <StatusIcon status={item.roadmapStatus || undefined} className="w-[18px] h-[18px] text-foreground/80" />
        <span className="text-sm text-accent">{statusLabel(String(item.roadmapStatus || "pending"))}</span>
      </div>
    </Link>
  )
}

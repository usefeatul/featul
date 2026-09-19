"use client"

import Link from "next/link"
import { cn } from "@featul/ui/lib/utils"
import type { RequestItemData } from "@/types/request"
import { normalizeRoadmapStatus, statusLabel } from "@/lib/roadmap"
import Attributes from "./attributes"
import StatusIcon from "./StatusIcon"

export function QueueItem({
  item,
  workspaceSlug,
  query,
  active,
  onSelect,
}: {
  item: RequestItemData
  workspaceSlug: string
  query: string
  active: boolean
  onSelect: () => void
}) {
  const status = normalizeRoadmapStatus(item.roadmapStatus)
  const href = `/workspaces/${workspaceSlug}/requests/${item.slug}${query ? `?${query}` : ""}`

  return (
    <li
      className={cn(
        "transition-colors",
        active
          ? "bg-muted/65 dark:bg-white/[0.055]"
          : "hover:bg-muted/35 dark:hover:bg-white/[0.03]",
      )}
    >
      <div className="group/queue relative overflow-hidden px-5 py-3">
        <Link
          href={href}
          scroll={false}
          prefetch
          onClick={onSelect}
          aria-current={active ? "page" : undefined}
          aria-label={item.title}
          className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        />

        <div className="pointer-events-none relative min-w-0">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
            <StatusIcon status={status} className="size-3.5 shrink-0 text-foreground/70" />
            <span>{statusLabel(status)}</span>
            {active ? (
              <span className="ml-auto text-primary">Viewing</span>
            ) : null}
          </div>

          <p className="line-clamp-2 text-[13px] font-semibold leading-[18px] text-foreground/90">
            {item.title}
          </p>

          <Attributes item={item} />
        </div>
      </div>
    </li>
  )
}

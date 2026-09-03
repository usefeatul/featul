"use client"

import Link from "next/link"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip"
import { CircleQuestionMarkIcon } from "@featul/ui/icons/circle-question-mark"
import StatusIcon from "./StatusIcon"
import { normalizeRoadmapStatus, statusLabel } from "@/lib/roadmap"
import { relativeTime } from "@/lib/time"

export type MergePostSummary = {
  slug: string
  title: string
  roadmapStatus?: string | null
  boardName?: string | null
  mergedAt?: string | null
}

export function MergePostCard({
  href,
  post,
  fallbackDate,
}: {
  href: string
  post: MergePostSummary
  fallbackDate?: string | null
}) {
  const status = normalizeRoadmapStatus(post.roadmapStatus)

  return (
    <Link
      href={href}
      className={cn(
        overlayShellClass,
        "block w-full p-0.5 text-left transition-colors hover:bg-muted/30",
      )}
    >
      <div className={cn(overlayInnerClass, "flex flex-col gap-2 px-3 py-2.5")}>
        <div className="font-heading text-sm font-medium leading-snug text-foreground">
          {post.title || "Merged request"}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <StatusIcon status={status} className="size-3.5 shrink-0" />
            <span>{statusLabel(status)}</span>
          </span>
          {post.boardName ? (
            <OverlayChip
              innerClassName="h-5 min-h-5 max-w-[9.5rem] gap-1 px-1.5 text-[11px] font-medium text-accent"
            >
              <span className="min-w-0 truncate">{post.boardName}</span>
            </OverlayChip>
          ) : null}
          <span>{relativeTime(post.mergedAt || fallbackDate)}</span>
        </div>
      </div>
    </Link>
  )
}

export function MergeSubmissionSection({
  mergedInto,
  mergedIntoHref,
  mergedSources,
  sourceHref,
  fallbackDate,
}: {
  mergedInto?: MergePostSummary | null
  mergedIntoHref?: string
  mergedSources?: MergePostSummary[]
  sourceHref: (slug: string) => string
  fallbackDate?: string | null
}) {
  const hasTarget = Boolean(mergedIntoHref && mergedInto)
  const sources = mergedSources ?? []
  if (!hasTarget && sources.length === 0) return null

  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <span>Merge submission</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="About merges"
              className="inline-flex items-center rounded-sm text-accent hover:text-foreground"
            >
              <CircleQuestionMarkIcon className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            Shows when requests are merged to consolidate duplicates.
          </TooltipContent>
        </Tooltip>
      </div>
      {hasTarget && mergedInto && mergedIntoHref ? (
        <MergePostCard
          href={mergedIntoHref}
          post={mergedInto}
          fallbackDate={fallbackDate}
        />
      ) : null}
      {sources.length > 0 ? (
        <div className="flex flex-col gap-2">
          {sources.map((source) => (
            <MergePostCard
              key={source.slug}
              href={sourceHref(source.slug)}
              post={source}
              fallbackDate={fallbackDate}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import BoardPicker from "./meta/BoardPicker"
import StatusPicker from "./meta/StatusPicker"
import FlagsPicker from "./meta/FlagsPicker"
import TagsPicker from "./meta/TagsPicker"
import StatusIcon from "./StatusIcon"
import { relativeTime } from "@/lib/time"
import type { RequestDetailData } from "@/types/request"
import type { TagSummary } from "@/types/post"
import type { RequestDetailBoardState, RequestDetailMetaState } from "@/hooks/useRequestDetailMeta"
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip"
import { CircleQuestionMarkIcon } from "@featul/ui/icons/circle-question-mark"
import { cn } from "@featul/ui/lib/utils"

type MergeTarget = NonNullable<RequestDetailData["mergedInto"]>
type MergeSource = NonNullable<RequestDetailData["mergedSources"]>[number]

export type RequestPropertiesProps = {
  post: RequestDetailData
  workspaceSlug: string
  canEdit: boolean
  meta: RequestDetailMetaState
  onMetaChange: (value: Partial<RequestDetailMetaState>) => void
  board: RequestDetailBoardState
  onBoardChange: (value: RequestDetailBoardState) => void
  tags: TagSummary[]
  onTagsChange: (value: TagSummary[]) => void
  className?: string
}

function PropertyRow({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="inline-flex h-8 shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <span>{label}</span>
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`About ${label.toLowerCase()}`}
                className="inline-flex items-center rounded-sm text-accent hover:text-foreground"
              >
                <CircleQuestionMarkIcon className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {hint}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function MergeCard({
  href,
  title,
  roadmapStatus,
  boardName,
  dateLabel,
  eyebrow,
}: {
  href: string
  title: string
  roadmapStatus?: string | null
  boardName?: string
  dateLabel: string
  eyebrow?: string
}) {
  return (
    <Link
      href={href}
      className="block space-y-2 rounded-md border border-border bg-background p-3 transition-colors hover:bg-muted/30"
    >
      {eyebrow ? <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</div> : null}
      <div className="text-sm font-medium leading-snug text-foreground">{title}</div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <StatusIcon status={roadmapStatus || "pending"} className="size-4" />
        <span className="capitalize">{roadmapStatus || "Open"}</span>
        {boardName ? (
          <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{boardName}</span>
        ) : null}
        <span>{dateLabel}</span>
      </div>
    </Link>
  )
}

function MergeLinkCard({
  workspaceSlug,
  item,
  fallbackDate,
  eyebrow,
}: {
  workspaceSlug: string
  item: MergeTarget | MergeSource
  fallbackDate: string
  eyebrow?: string
}) {
  return (
    <MergeCard
      href={`/workspaces/${workspaceSlug}/requests/${item.slug}`}
      title={item.title}
      roadmapStatus={item.roadmapStatus}
      boardName={item.boardName}
      dateLabel={relativeTime(item.mergedAt || fallbackDate)}
      eyebrow={eyebrow}
    />
  )
}

export default function RequestProperties({
  post,
  workspaceSlug,
  canEdit,
  meta,
  onMetaChange,
  board,
  onBoardChange,
  tags,
  onTagsChange,
  className,
}: RequestPropertiesProps) {
  const showFlags = canEdit || meta.isPinned || meta.isLocked || meta.isFeatured
  const showTags = canEdit || (tags && tags.length > 0)
  const hasMerge =
    Boolean(post.duplicateOfId) || Boolean(post.mergedSources && post.mergedSources.length > 0)

  return (
    <div className={cn("space-y-4", className)}>
      <PropertyRow label="Board">
        {canEdit ? (
          <BoardPicker
            workspaceSlug={workspaceSlug}
            postId={post.id}
            value={board}
            onChange={onBoardChange}
          />
        ) : (
          <div className="flex h-8 items-center rounded-md border px-2.5 text-xs font-medium">{board.name}</div>
        )}
      </PropertyRow>

      <PropertyRow label="Status">
        {canEdit ? (
          <StatusPicker
            postId={post.id}
            value={meta.roadmapStatus}
            onChange={(v) => onMetaChange({ roadmapStatus: v })}
          />
        ) : (
          <div className="flex h-8 items-center rounded-md border px-2 pl-1.5 text-xs font-medium capitalize">
            <StatusIcon status={meta.roadmapStatus || "pending"} className="mr-2 size-4" />
            {meta.roadmapStatus || "Open"}
          </div>
        )}
      </PropertyRow>

      {showFlags ? (
        <PropertyRow label="Flags">
          {canEdit ? (
            <FlagsPicker postId={post.id} value={meta} onChange={(v) => onMetaChange(v)} />
          ) : (
            <div className="flex flex-wrap justify-end gap-1">
              {[
                meta.isPinned ? "Pinned" : null,
                meta.isLocked ? "Locked" : null,
                meta.isFeatured ? "Featured" : null,
              ]
                .filter(Boolean)
                .map((f) => (
                  <span
                    key={f as string}
                    className="rounded-md border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
            </div>
          )}
        </PropertyRow>
      ) : null}

      {showTags ? (
        <div className="space-y-2 border-t border-border/50 pt-4">
          <PropertyRow
            label="Tags"
            hint="Tags categorize requests for filtering and reporting."
          >
            {canEdit ? (
              <TagsPicker
                workspaceSlug={workspaceSlug}
                postId={post.id}
                value={tags}
                onChange={onTagsChange}
              />
            ) : null}
          </PropertyRow>
          {tags && tags.length > 0 ? (
            <div className="flex w-full flex-wrap gap-1">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-medium leading-5 text-primary"
                >
                  {t.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasMerge ? (
        <div className="space-y-3 border-t border-border/50 pt-4">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <span>Related merges</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="About merges"
                  className="inline-flex items-center rounded-sm text-accent hover:text-foreground"
                >
                  <CircleQuestionMarkIcon className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                Shows when requests are merged to consolidate duplicates.
              </TooltipContent>
            </Tooltip>
          </div>

          {post.duplicateOfId && post.mergedInto ? (
            <MergeLinkCard
              workspaceSlug={workspaceSlug}
              item={post.mergedInto}
              fallbackDate={post.createdAt}
              eyebrow="Merged into"
            />
          ) : null}

          {post.mergedSources && post.mergedSources.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Merged into this request
              </div>
              {post.mergedSources.map((src) => (
                <MergeLinkCard
                  key={src.id}
                  workspaceSlug={workspaceSlug}
                  item={src}
                  fallbackDate={post.createdAt}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

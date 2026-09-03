"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import StatusIcon from "./StatusIcon"
import { CommentsIcon } from "@featul/ui/icons/comments"
import { LockIcon } from "@featul/ui/icons/lock"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import { randomAvatarUrl } from "@/utils/avatar"
import RoleBadge from "@/components/global/RoleBadge"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { RequestItemContextMenu } from "./RequestItemContextMenu"
import { ReportIndicator } from "./ReportIndicator"
import { StaleMark } from "./StaleIndicator"
import { SnoozeIndicator } from "./SnoozeIndicator"
import { FlagRibbon } from "@/components/global/FlagRibbon"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
import type { RequestItemData } from "@/types/request"
import type { TagSummary } from "@/types/post"
import { SelectionControl } from "@/components/selection/SelectionControl"
import {
  getSelectableRowClassName,
  type SelectionToggleMeta,
} from "@/components/selection/Row"
import { getRequestStaleDays } from "@/utils/request/stale"
import { isActivelySnoozed } from "@featul/api/shared/snooze"
import { relativeTime } from "@/lib/time"
import { normalizeRoadmapStatus } from "@/lib/roadmap"

interface RequestItemProps {
  item: RequestItemData
  workspaceSlug: string
  linkBase?: string
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (checked: boolean, meta?: SelectionToggleMeta) => void
  disableLink?: boolean
}

const metaChipInnerClass =
  "h-6 min-h-6 max-w-full gap-1.5 px-2 text-xs font-medium text-accent"

function RequestMetaChip({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <OverlayChip
      className="max-w-[9.5rem]"
      innerClassName={metaChipInnerClass}
    >
      <span className="inline-flex min-w-0 max-w-full items-center gap-1.5" title={title}>
        {children}
      </span>
    </OverlayChip>
  )
}

function RequestBoardChip({ name }: { name: string }) {
  return (
    <RequestMetaChip title={name}>
      <span className="min-w-0 truncate">{name}</span>
    </RequestMetaChip>
  )
}

function RequestTagPills({
  tags,
  boardName,
}: {
  tags?: TagSummary[]
  boardName?: string | null
}) {
  const hasBoard = Boolean(boardName?.trim())
  const list = tags ?? []
  if (!hasBoard && list.length === 0) return null

  const visible = list.slice(0, 2)
  const extra = list.length - visible.length

  return (
    <div className="hidden min-w-0 shrink-0 items-center gap-1.5 md:flex">
      {hasBoard ? <RequestBoardChip name={boardName!} /> : null}
      {visible.map((tag) => (
        <RequestMetaChip key={tag.id} title={tag.name}>
          <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <span className="min-w-0 truncate">{tag.name}</span>
        </RequestMetaChip>
      ))}
      {extra > 0 ? (
        <OverlayChip innerClassName={cn(metaChipInnerClass, "px-2 tabular-nums")}>
          +{extra}
        </OverlayChip>
      ) : null}
    </div>
  )
}

function RequestItemBase({ item, workspaceSlug, linkBase, isSelecting, isSelected, onToggle, disableLink }: RequestItemProps) {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : ""
  const base = linkBase || `/workspaces/${workspaceSlug}`
  const href = `${base}/requests/${item.slug}${queryString}`
  const title = item.title ?? ""
  const displayTitle = title.length > 110 ? `${title.slice(0, 110).trimEnd()}…` : title
  const isSelectingMode = Boolean(isSelecting)
  const isSelectedMode = Boolean(isSelected)
  const isLinkDisabled = Boolean(disableLink || isSelectingMode)
  const authorLabel = item.isAnonymous ? "Guest" : (item.authorName || "Guest")
  const staleDays = getRequestStaleDays({
    createdAt: item.createdAt,
    publishedAt: item.publishedAt,
    updatedAt: item.updatedAt,
    roadmapStatus: item.roadmapStatus,
  })
  const isStale = staleDays != null
  const isSnoozed = isActivelySnoozed(item.snoozedUntil)
  const status = normalizeRoadmapStatus(item.roadmapStatus)
  const isSettled = status === "completed" || status === "closed"
  const handleRowClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback((e) => {
    if (!isSelectingMode) return
    e.preventDefault()
    e.stopPropagation()
    onToggle?.(!isSelectedMode, { shiftKey: e.shiftKey })
  }, [isSelectingMode, isSelectedMode, onToggle])
  const rowClassName = getSelectableRowClassName(
    isSelectingMode,
    isSelectedMode,
    cn(
      "group/request relative flex items-center gap-3 overflow-hidden border-l-2 px-4 py-3",
      isSnoozed
        ? "border-l-sky-500 dark:border-l-sky-400"
        : isStale
          ? "border-l-amber-600 dark:border-l-amber-500"
          : "border-l-transparent",
    ),
    "hover:bg-muted/50 dark:hover:bg-white/[0.04]",
  )
  const actionsClassName = cn(
    "ml-auto flex shrink-0 items-center gap-3 text-xs text-muted-foreground",
    isSelectingMode && "pointer-events-none",
  )
  const publishedLabel = relativeTime(item.publishedAt ?? item.createdAt)

  return (
    <li className="list-none">
      <RequestItemContextMenu
        item={item}
        workspaceSlug={workspaceSlug}
        requestHref={href}
        listKey={workspaceSlug}
        isSelecting={isSelectingMode}
        isSelected={isSelectedMode}
        onToggle={onToggle}
        className={rowClassName}
        onClick={handleRowClick}
      >
        {isLinkDisabled ? null : (
          <Link
            href={href}
            className="absolute inset-0 z-0"
            aria-label={displayTitle}
          />
        )}
        <FlagRibbon isPinned={item.isPinned} isFeatured={item.isFeatured} />
        {staleDays != null ? <StaleMark days={staleDays} /> : null}
        {isSelectingMode ? (
          <SelectionControl
            checked={isSelectedMode}
            label={isSelectedMode ? "Deselect post" : "Select post"}
            onCheckedChange={(v) => onToggle?.(v)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
        <StatusIcon status={status} className="size-5 shrink-0 text-foreground/80" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {item.isLocked ? (
            <LockIcon
              width={14}
              height={14}
              className="size-3.5 shrink-0 text-muted-foreground"
              aria-label="Locked"
            />
          ) : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm font-medium leading-5",
              isLinkDisabled || isSnoozed || isSettled
                ? "text-muted-foreground"
                : "text-foreground",
            )}
          >
            {displayTitle}
          </span>
          <RequestTagPills tags={item.tags} boardName={item.boardName} />
        </div>
        <div className={actionsClassName}>
          <div className="relative z-10 inline-flex items-center gap-3">
            <ReportIndicator count={item.reportCount || 0} />
            <SnoozeIndicator snoozedUntil={item.snoozedUntil} />
            <UpvoteButton postId={item.id} upvotes={item.upvotes} hasVoted={item.hasVoted} className="text-xs hover:text-red-500/80" />
          </div>
          {item.commentCount > 0 ? (
            <div className="inline-flex items-center gap-1">
              <CommentsIcon aria-hidden className="size-3.5" />
              <span className="tabular-nums">{item.commentCount}</span>
            </div>
          ) : null}
          <span className="hidden min-w-[2.5rem] text-right tabular-nums sm:inline">
            {publishedLabel}
          </span>
          <div className="relative">
            <Avatar className="size-6 bg-muted ring-1 ring-border relative overflow-visible">
              <AvatarImage src={item.authorImage || randomAvatarUrl(item.id || item.slug)} alt={authorLabel} />
              <AvatarFallback>{getInitials(authorLabel)}</AvatarFallback>
              <RoleBadge role={item.role} isOwner={item.isOwner} isFeatul={item.isFeatul} />
            </Avatar>
          </div>
        </div>
      </RequestItemContextMenu>
    </li>
  )
}

export default React.memo(RequestItemBase)

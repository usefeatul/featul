"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import StatusIcon from "./StatusIcon"
import { CommentsIcon } from "@featul/ui/icons/comments"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import { randomAvatarUrl } from "@/utils/avatar"
import RoleBadge from "@/components/global/RoleBadge"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { RequestItemContextMenu } from "./RequestItemContextMenu"
import { ReportIndicator } from "./ReportIndicator"
import { StaleMark } from "./StaleIndicator"
import { LowInteractionMark } from "./LowInteractionIndicator"
import { SnoozeIndicator } from "./SnoozeIndicator"
import { getActiveRequestFlags } from "@/components/global/flag-visuals"
import type { RequestItemData } from "@/types/request"
import type { TagSummary } from "@/types/post"
import { SelectionControl } from "@/components/selection/SelectionControl"
import {
  getSelectableRowClassName,
  type SelectionToggleMeta,
} from "@/components/selection/Row"
import { getRequestStaleDays } from "@/utils/request/stale"
import { getRequestLowInteractionDays } from "@/utils/request/low-interaction"
import { isActivelySnoozed } from "@featul/api/shared/snooze"
import { relativeTime } from "@/lib/time"
import { normalizeRoadmapStatus } from "@/lib/roadmap"
import { requestBadgeClass } from "./styles"

interface RequestItemProps {
  item: RequestItemData
  workspaceSlug: string
  linkBase?: string
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (checked: boolean, meta?: SelectionToggleMeta) => void
  disableLink?: boolean
}

const metaChipInnerClass = cn(requestBadgeClass, "max-w-[9.5rem] uppercase tracking-[0.06em]")

function RequestMetaChip({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <span className={metaChipInnerClass}>
      <span className="inline-flex min-w-0 max-w-full items-center gap-1.5" title={title}>
        {children}
      </span>
    </span>
  )
}

function RequestBoardChip({ name }: { name: string }) {
  return (
    <RequestMetaChip title={name}>
      <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
      <span className="min-w-0 truncate uppercase tracking-wide">{name}</span>
    </RequestMetaChip>
  )
}

export function RequestTagPills({
  tags,
  boardName,
  expanded = false,
}: {
  tags?: TagSummary[]
  boardName?: string | null
  expanded?: boolean
}) {
  const hasBoard = Boolean(boardName?.trim())
  const list = tags ?? []
  if (!hasBoard && list.length === 0) return null

  const visible = expanded ? list : list.slice(0, 2)
  const extra = list.length - visible.length

  return (
    <div className={expanded ? "contents" : "hidden min-w-0 shrink-0 items-center gap-1.5 xl:flex"}>
      {hasBoard ? <RequestBoardChip name={boardName!} /> : null}
      {visible.map((tag) => (
        <RequestMetaChip key={tag.id} title={tag.name}>
          <span className="size-1.5 shrink-0 rounded-full bg-primary" style={tag.color ? { backgroundColor: tag.color } : undefined} aria-hidden />
          <span className="min-w-0 truncate">{tag.name}</span>
        </RequestMetaChip>
      ))}
      {extra > 0 ? (
        <span className={cn(metaChipInnerClass, "tabular-nums")}>
          +{extra}
        </span>
      ) : null}
    </div>
  )
}

export function RequestEngagementChip({
  postId,
  upvotes,
  hasVoted,
  commentCount,
  showComments = false,
}: {
  postId: string
  upvotes: number
  hasVoted?: boolean
  commentCount: number
  showComments?: boolean
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 tabular-nums">
      <UpvoteButton
        postId={postId}
        upvotes={upvotes}
        hasVoted={hasVoted}
        className={cn(requestBadgeClass, "relative z-10 gap-1 aria-pressed:text-red-500 hover:bg-muted/80 dark:hover:bg-[#2c2c2c]")}
      />
      <span className={cn(requestBadgeClass, "gap-1", !showComments && "hidden sm:inline-flex")} title={`${commentCount} comments`}>
        <CommentsIcon aria-hidden className="size-3" />
        <span>{commentCount}</span>
      </span>
    </span>
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
  const lowInteractionDays = getRequestLowInteractionDays({
    createdAt: item.createdAt,
    publishedAt: item.publishedAt,
    roadmapStatus: item.roadmapStatus,
    upvotes: item.upvotes,
    commentCount: item.commentCount,
  })
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
    "group/request relative flex min-h-10 items-center gap-3 overflow-hidden px-4 py-1.5 sm:px-6",
    "hover:bg-muted/50 dark:hover:bg-white/[0.04]",
  )
  const actionsClassName = cn(
    "relative z-10 flex shrink-0 items-center gap-2 text-xs text-muted-foreground lg:gap-3",
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
        {isSelectingMode ? (
          <SelectionControl
            checked={isSelectedMode}
            label={isSelectedMode ? "Deselect post" : "Select post"}
            onCheckedChange={(v) => onToggle?.(v)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
        <StatusIcon status={status} className="size-4 shrink-0 text-foreground/80" />
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={cn(
              "min-w-0 truncate text-sm font-medium leading-5",
              isLinkDisabled || isSnoozed || isSettled
                ? "text-muted-foreground"
                : "text-foreground",
            )}
          >
            {displayTitle}
          </span>
          {lowInteractionDays != null ? (
            <LowInteractionMark
              days={lowInteractionDays}
              className={cn(
                "relative z-10 appearance-none border-0",
                isSelectingMode && "pointer-events-none",
              )}
            />
          ) : null}
        </span>
        <div className={actionsClassName}>
          {getActiveRequestFlags(item).map(({ key, label, Icon, iconClass }) => (
            <span key={key} title={label} aria-label={label} className="inline-flex shrink-0">
              <Icon className={cn("size-3.5", iconClass)} />
            </span>
          ))}
          {staleDays != null ? <StaleMark days={staleDays} className="hidden sm:inline-flex" /> : null}
          <ReportIndicator count={item.reportCount || 0} />
          <SnoozeIndicator snoozedUntil={item.snoozedUntil} />
          <RequestEngagementChip
            postId={item.id}
            upvotes={item.upvotes}
            hasVoted={item.hasVoted}
            commentCount={item.commentCount}
          />
          <RequestTagPills tags={item.tags} boardName={item.boardName} />
          <span className="hidden w-12 text-right text-[11px] tabular-nums sm:inline">
            {publishedLabel}
          </span>
          <div className="relative">
            <Avatar className="size-6 bg-muted relative overflow-visible">
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

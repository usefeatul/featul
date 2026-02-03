"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import StatusIcon from "./StatusIcon"
import { CommentsIcon } from "@featul/ui/icons/comments"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { Checkbox } from "@featul/ui/components/checkbox"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user-utils"
import { randomAvatarUrl } from "@/utils/avatar"
import RoleBadge from "@/components/global/RoleBadge"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { RequestItemContextMenu } from "./RequestItemContextMenu"
import { ReportIndicator } from "./ReportIndicator"
import { FlagRibbon } from "@/components/global/FlagRibbon"
import type { RequestItemData } from "@/types/request"

interface RequestItemProps {
  item: RequestItemData
  workspaceSlug: string
  linkBase?: string
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (checked: boolean) => void
  disableLink?: boolean
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
  const handleRowClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback((e) => {
    if (!isSelectingMode) return
    e.preventDefault()
    e.stopPropagation()
    onToggle?.(!isSelectedMode)
  }, [isSelectingMode, isSelectedMode, onToggle])
  const rowClassName = cn(
    "flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-border/70 bg-card dark:bg-black/40 last:border-b-0 relative overflow-hidden",
    isSelectingMode ? "cursor-pointer" : "hover:bg-background dark:hover:bg-background transition-colors"
  )
  const actionsClassName = cn(
    "ml-auto flex items-center gap-3 text-xs text-accent",
    isSelectingMode && "pointer-events-none"
  )

  return (
    <RequestItemContextMenu
      item={item}
      workspaceSlug={workspaceSlug}
      className={rowClassName}
      onClick={handleRowClick}
    >
      <FlagRibbon isPinned={item.isPinned} isFeatured={item.isFeatured} />
      {isSelectingMode ? (
        <Checkbox
          checked={isSelectedMode}
          onCheckedChange={(v) => onToggle?.(Boolean(v))}
          aria-label="Select post"
          onClick={(e) => e.stopPropagation()}
          className="mr-1 cursor-pointer border-border dark:border-border data-[state=checked]:border-primary"
        />
      ) : null}
      <StatusIcon status={item.roadmapStatus || undefined} className="size-5 text-foreground/80" />
      <Link
        href={href}
        className={cn(
          "flex-1 min-w-0 truncate text-sm font-medium",
          isLinkDisabled ? "text-foreground/60 cursor-default pointer-events-none" : "text-foreground"
        )}
        onClick={(e) => {
          if (isLinkDisabled) e.preventDefault()
        }}
        tabIndex={isLinkDisabled ? -1 : 0}
        aria-disabled={isLinkDisabled ? true : undefined}
      >
        {displayTitle}
      </Link>
      <div className={actionsClassName}>
        <ReportIndicator count={item.reportCount || 0} />

        <div className="inline-flex items-center gap-2 relative z-10">
          <UpvoteButton postId={item.id} upvotes={item.upvotes} hasVoted={item.hasVoted} className="text-xs hover:text-red-500/80" />
        </div>
        <div className="inline-flex items-center gap-1">
          <CommentsIcon aria-hidden className="size-3.5" />
          <span className="tabular-nums">{item.commentCount}</span>
        </div>
        <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(new Date(item.publishedAt ?? item.createdAt))}</span>
        <div className="relative">
          <Avatar className="size-6 bg-muted ring-1 ring-border relative overflow-visible">
            <AvatarImage src={item.authorImage || randomAvatarUrl(item.id || item.slug)} alt={authorLabel} />
            <AvatarFallback>{getInitials(authorLabel)}</AvatarFallback>
            <RoleBadge role={item.role} isOwner={item.isOwner} isFeatul={item.isFeatul} />
          </Avatar>
        </div>
      </div>
    </RequestItemContextMenu>
  )
}

export default React.memo(RequestItemBase)

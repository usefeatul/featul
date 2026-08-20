import React from "react"
import { relativeTime } from "@/lib/time"
import PinnedBadge from "./PinnedBadge"
import CommentCollapseToggle from "./CommentCollapseToggle"
import { Badge } from "@featul/ui/components/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip"
import { EditIcon } from "@featul/ui/icons/edit"
import { LockIcon } from "@featul/ui/icons/lock"
import { ReportIndicator } from "../requests/ReportIndicator"
import type { CommentData } from "../../types/comment"

interface CommentHeaderProps {
  comment: CommentData
  isOwner: boolean
  hasReplies: boolean
  isCollapsed: boolean
  onToggleCollapse?: () => void
  hidePublicMemberIdentity?: boolean
}

export default function CommentHeader({
  comment,
  isOwner,
  hasReplies,
  isCollapsed,
  onToggleCollapse,
  hidePublicMemberIdentity,
}: CommentHeaderProps) {
  const isGuest = !comment.authorName || comment.authorName === "Guest"
  const displayName = hidePublicMemberIdentity && !isGuest ? "Member" : comment.authorName
  const editedAt = comment.editedAt || comment.updatedAt || comment.createdAt
  const editedLabel = relativeTime(editedAt)

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 leading-none">
      <span className="text-sm font-semibold text-foreground">
        {displayName}
      </span>
      <span className="text-xs text-muted-foreground/60">
        {relativeTime(comment.createdAt)}
      </span>
      {comment.isEdited && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="nav" className="gap-1 px-1 py-0.5 text-[10px] leading-none text-accent">
              <EditIcon width={12} height={12} className="text-accent" />
              Edited
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="w-auto whitespace-nowrap px-2 py-1 text-xs">
            {editedLabel ? `Edited ${editedLabel}` : "Edited"}
          </TooltipContent>
        </Tooltip>
      )}
      {comment.isPinned && <PinnedBadge />}
      {comment.isInternal && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="nav" className="gap-1 px-1 py-0.5 text-[10px] leading-none text-accent">
              <LockIcon width={11} height={11} className="text-accent" />
              Internal
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4} className="w-auto whitespace-nowrap px-2 py-1 text-xs">
            Internal only
          </TooltipContent>
        </Tooltip>
      )}
      {hasReplies && onToggleCollapse && (
        <CommentCollapseToggle
          isCollapsed={isCollapsed}
          replyCount={comment.replyCount}
          onToggle={onToggleCollapse}
        />
      )}
      {isOwner && (
        <ReportIndicator count={comment.reportCount || 0} />
      )}
    </div>
  )
}

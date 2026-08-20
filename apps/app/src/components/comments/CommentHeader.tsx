import React from "react"
import { relativeTime } from "@/lib/time"
import PinnedBadge from "./PinnedBadge"
import CommentCollapseToggle from "./CommentCollapseToggle"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
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
            <OverlayChip innerClassName="gap-1 bg-primary/10 px-1.5 font-medium text-primary dark:bg-primary/10">
              <EditIcon width={10} height={10} className="text-primary" />
              Edited
            </OverlayChip>
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
            <OverlayChip innerClassName="gap-1 bg-primary/10 px-1.5 font-medium text-primary dark:bg-primary/10">
              <LockIcon width={10} height={10} className="text-primary" />
              Internal
            </OverlayChip>
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

import React from "react"
import { relativeTime } from "@/lib/time"
import PinnedBadge from "./PinnedBadge"
import CommentCollapseToggle from "./CommentCollapseToggle"
import CommentActions from "./actions/CommentActions"
import { Badge } from "@featul/ui/components/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip"
import { EditIcon } from "@featul/ui/icons/edit"
import { ReportIndicator } from "../requests/ReportIndicator"
import type { CommentData } from "../../types/comment"

interface CommentHeaderProps {
  comment: CommentData
  isEditing: boolean
  isAuthor: boolean
  isOwner: boolean
  canDelete: boolean
  hasReplies: boolean
  isCollapsed: boolean
  onToggleCollapse?: () => void
  onEdit: () => void
  onDeleteSuccess?: () => void
  hidePublicMemberIdentity?: boolean
}

export default function CommentHeader({
  comment,
  isEditing,
  isAuthor,
  isOwner,
  canDelete,
  hasReplies,
  isCollapsed,
  onToggleCollapse,
  onEdit,
  onDeleteSuccess,
  hidePublicMemberIdentity,
}: CommentHeaderProps) {
  // Guest check must match CommentItem: null/undefined or "Guest" are all considered guests
  const isGuest = !comment.authorName || comment.authorName === "Guest"
  const displayName = hidePublicMemberIdentity && !isGuest ? "Member" : comment.authorName
  const editedAt = comment.editedAt || comment.updatedAt || comment.createdAt
  const editedLabel = relativeTime(editedAt)

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap leading-none">
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
        {hasReplies && onToggleCollapse && (
          <CommentCollapseToggle
            isCollapsed={isCollapsed}
            replyCount={comment.replyCount}
            onToggle={onToggleCollapse}
            className="ml-auto sm:ml-0"
          />
        )}
        {isOwner && (
          <ReportIndicator count={comment.reportCount || 0} className="ml-2" />
        )}
      </div>

      {!isEditing && (
        <div>
          <CommentActions
            commentId={comment.id}
            postId={comment.postId}
            isAuthor={isAuthor}
            canDelete={canDelete}
            canPin={isOwner}
            isPinned={!!comment.isPinned}
            onEdit={onEdit}
            onDeleteSuccess={onDeleteSuccess}
          />
        </div>
      )}
    </div>
  )
}

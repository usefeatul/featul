"use client"

import React, { useState } from "react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar"
import { cn } from "@featul/ui/lib/utils"
import CommentForm from "./CommentForm"
import RoleBadge from "../global/RoleBadge"
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess"
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user-utils"
import CommentHeader from "./CommentHeader"
import CommentContent from "./CommentContent"
import CommentEditor from "./CommentEditor"
import CommentFooter from "./CommentFooter"
import { useCommentEdit } from "../../hooks/useCommentEdit"
import type { CommentData } from "../../types/comment"

interface CommentItemProps {
  comment: CommentData
  currentUserId?: string | null
  onReplySuccess?: () => void
  onUpdate?: () => void
  depth?: number
  hasReplies?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  workspaceSlug?: string
  hidePublicMemberIdentity?: boolean
}

export default function CommentItem({
  comment,
  currentUserId,
  onReplySuccess,
  onUpdate,
  depth = 0,
  hasReplies = false,
  isCollapsed = false,
  onToggleCollapse,
  workspaceSlug,
  hidePublicMemberIdentity,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const { isOwner } = useWorkspaceRole(workspaceSlug || "")
  const isAuthor = currentUserId ? comment.authorId === currentUserId : false
  const canDelete = isAuthor || (workspaceSlug ? isOwner : false)
  const canReply = depth < 3 // Limit nesting to 3 levels

  const {
    isEditing,
    setIsEditing,
    editContent,
    setEditContent,
    isPending,
    handleKeyDown,
    handleBlur,
  } = useCommentEdit({
    commentId: comment.id,
    initialContent: comment.content,
    onUpdate,
  })

  // Identity hiding logic
  const displayUser = getPrivacySafeDisplayUser(
    {
      name: comment.authorName || "Guest",
      image: comment.authorImage || "",
      email: ""
    },
    hidePublicMemberIdentity,
    comment.id // Use comment ID as seed
  )

  const isGuest = !comment.authorName || comment.authorName === "Guest"
  const showHiddenIdentity = hidePublicMemberIdentity && !isGuest

  const initials = getInitials(displayUser.name)

  return (
    <div className={cn("flex gap-3 group")}>
      <div className="relative not-visited:shrink-0">
        <Avatar className="size-8 relative overflow-visible">
          <AvatarImage src={displayUser.image} alt={displayUser.name} />
          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
          {!showHiddenIdentity && <RoleBadge role={comment.role} isOwner={comment.isOwner} />}
        </Avatar>
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <div className="space-y-1">
          <CommentHeader
            comment={comment}
            isEditing={isEditing}
            isAuthor={isAuthor}
            isOwner={isOwner}
            canDelete={canDelete}
            hasReplies={hasReplies}
            isCollapsed={isCollapsed || false}
            onToggleCollapse={onToggleCollapse}
            onEdit={() => setIsEditing(true)}
            onDeleteSuccess={onUpdate}
            hidePublicMemberIdentity={showHiddenIdentity}
          />

          {isEditing ? (
            <CommentEditor
              value={editContent}
              onChange={setEditContent}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              isPending={isPending}
            />
          ) : (
            <CommentContent
              content={comment.content}
              metadata={comment.metadata}
            />
          )}
        </div>

        {!isEditing && (
          <CommentFooter
            commentId={comment.id}
            postId={comment.postId}
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.userVote}
            canReply={canReply}
            showReplyForm={showReplyForm}
            onToggleReply={() => setShowReplyForm(!showReplyForm)}
          />
        )}

        {showReplyForm && (
          <div className="mt-3 pt-2">
            <div className="pl-1">
              <div className="rounded-md border bg-background dark:bg-background p-3.5">
                <CommentForm
                  postId={comment.postId}
                  parentId={comment.id}
                  workspaceSlug={workspaceSlug}
                  onSuccess={() => {
                    setShowReplyForm(false)
                    onReplySuccess?.()
                  }}
                  placeholder="Write a reply..."
                  autoFocus
                  buttonText="Reply"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

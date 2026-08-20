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
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user"
import CommentHeader from "./CommentHeader"
import CommentContent from "./CommentContent"
import CommentEditor from "./CommentEditor"
import CommentFooter from "./CommentFooter"
import { useCommentEdit } from "../../hooks/useCommentEdit"
import type { CommentData } from "../../types/comment"
import type { CommentSurface } from "@/lib/comment/shared"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

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
  surface?: CommentSurface
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
  surface = "workspace",
  hidePublicMemberIdentity,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  const { isOwner, role } = useWorkspaceRole(workspaceSlug || "")
  const isAuthor = currentUserId ? comment.authorId === currentUserId : false
  const canDelete = isAuthor || (workspaceSlug ? isOwner : false)
  const canUseInternalComments = Boolean(workspaceSlug && (isOwner || role !== null))
  const canToggleVisibility = surface === "workspace" && canDelete && canUseInternalComments
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
    <div className={cn(settingsCardShellClass, "group min-w-0")}>
      <header className="flex min-w-0 items-center gap-2.5 py-2">
        <Avatar className="relative size-7 shrink-0 overflow-visible">
          <AvatarImage src={displayUser.image} alt={displayUser.name} />
          <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
            {initials}
          </AvatarFallback>
          {!showHiddenIdentity && (
            <RoleBadge role={comment.role} isOwner={comment.isOwner} />
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <CommentHeader
            comment={comment}
            isEditing={isEditing}
            isAuthor={isAuthor}
            isOwner={isOwner}
            canDelete={canDelete}
            canToggleVisibility={canToggleVisibility}
            hasReplies={hasReplies}
            isCollapsed={isCollapsed || false}
            onToggleCollapse={onToggleCollapse}
            onEdit={() => setIsEditing(true)}
            onDeleteSuccess={onUpdate}
            surface={surface}
            hidePublicMemberIdentity={showHiddenIdentity}
          />
        </div>
      </header>

      <div className={settingsCardInnerClass}>
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

        {!isEditing && (
          <CommentFooter
            commentId={comment.id}
            postId={comment.postId}
            surface={surface}
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.userVote}
            canReply={canReply}
            showReplyForm={showReplyForm}
            onToggleReply={() => setShowReplyForm(!showReplyForm)}
          />
        )}
      </div>

      {showReplyForm && (
        <div className={cn(settingsCardInnerClass, "mt-2")}>
          <CommentForm
            postId={comment.postId}
            parentId={comment.id}
            workspaceSlug={workspaceSlug}
            surface={surface}
            defaultInternal={Boolean(comment.isInternal)}
            onSuccess={() => {
              setShowReplyForm(false)
              onReplySuccess?.()
            }}
            placeholder="Write a reply..."
            autoFocus
            buttonText="Reply"
          />
        </div>
      )}
    </div>
  )
}

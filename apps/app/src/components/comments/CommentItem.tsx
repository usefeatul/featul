"use client"

import React, { useState } from "react"
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar"
import CommentForm from "./CommentForm"
import RoleBadge from "../global/RoleBadge"
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess"
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user"
import CommentHeader from "./CommentHeader"
import CommentContent from "./CommentContent"
import CommentEditor from "./CommentEditor"
import CommentVote from "./CommentVote"
import CommentReplyButton from "./actions/CommentReplyAction"
import CommentActions from "./actions/CommentActions"
import { useCommentEdit } from "../../hooks/useCommentEdit"
import type { CommentData } from "../../types/comment"
import type { CommentSurface } from "@/lib/comment/shared"
import { settingsCardInnerClass } from "@/components/settings/global/SectionCard"
import { cn } from "@featul/ui/lib/utils"

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
  const canReply = depth < 3

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

  const displayUser = getPrivacySafeDisplayUser(
    {
      name: comment.authorName || "Guest",
      image: comment.authorImage || "",
      email: ""
    },
    hidePublicMemberIdentity,
    comment.id
  )

  const isGuest = !comment.authorName || comment.authorName === "Guest"
  const showHiddenIdentity = hidePublicMemberIdentity && !isGuest
  const initials = getInitials(displayUser.name)
  const indentPx = depth * 24

  return (
    <div className="group min-w-0">
      <div className="flex min-w-0 items-start gap-2">
        <div
          className="flex min-w-0 flex-1 items-start gap-2.5"
          style={{ paddingLeft: indentPx }}
        >
          {depth > 0 ? (
            <span
              aria-hidden
              className="mt-3 h-px w-3 shrink-0 bg-border/70 dark:bg-white/15"
            />
          ) : null}
          <Avatar className="relative mt-0.5 size-7 shrink-0 overflow-visible">
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
              isOwner={isOwner}
              hasReplies={hasReplies}
              isCollapsed={isCollapsed || false}
              onToggleCollapse={onToggleCollapse}
              hidePublicMemberIdentity={showHiddenIdentity}
            />

            <div className="mt-1">
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

            {!isEditing ? (
              <div className="mt-2">
                <CommentVote
                  commentId={comment.id}
                  postId={comment.postId}
                  surface={surface}
                  initialUpvotes={comment.upvotes}
                  initialDownvotes={comment.downvotes}
                  initialUserVote={comment.userVote}
                />
              </div>
            ) : null}
          </div>
        </div>

        {!isEditing ? (
          <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
            <CommentActions
              commentId={comment.id}
              postId={comment.postId}
              isAuthor={isAuthor}
              canDelete={canDelete}
              canToggleVisibility={canToggleVisibility}
              canPin={isOwner}
              isPinned={!!comment.isPinned}
              isInternal={Boolean(comment.isInternal)}
              surface={surface}
              onEdit={() => setIsEditing(true)}
              onDeleteSuccess={onUpdate}
            />
            {canReply && !showReplyForm ? (
              <CommentReplyButton
                onClick={() => setShowReplyForm(true)}
                isActive={false}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {showReplyForm ? (
        <div className={cn(settingsCardInnerClass, "mt-3")}>
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
            onCancel={() => setShowReplyForm(false)}
            compact
            placeholder="Write a reply..."
            autoFocus
            buttonText="Reply"
          />
        </div>
      ) : null}
    </div>
  )
}

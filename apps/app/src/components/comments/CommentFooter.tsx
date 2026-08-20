import React from "react"
import CommentVote from "./CommentVote"
import CommentReplyButton from "./actions/CommentReplyAction"
import type { CommentSurface } from "@/lib/comment/shared"

interface CommentFooterProps {
  commentId: string
  postId: string
  surface?: CommentSurface
  upvotes: number
  downvotes: number
  userVote?: "upvote" | "downvote" | null
  canReply: boolean
  showReplyForm: boolean
  onToggleReply: () => void
  indentPx?: number
}

export default function CommentFooter({
  commentId,
  postId,
  surface = "workspace",
  upvotes,
  downvotes,
  userVote,
  canReply,
  showReplyForm,
  onToggleReply,
  indentPx = 0,
}: CommentFooterProps) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2">
      <div style={{ paddingLeft: indentPx }}>
        <CommentVote
          commentId={commentId}
          postId={postId}
          surface={surface}
          initialUpvotes={upvotes}
          initialDownvotes={downvotes}
          initialUserVote={userVote}
        />
      </div>

      {canReply && !showReplyForm ? (
        <CommentReplyButton
          onClick={onToggleReply}
          isActive={showReplyForm}
        />
      ) : null}
    </div>
  )
}

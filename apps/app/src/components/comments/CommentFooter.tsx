import React from "react"
import CommentVote from "./CommentVote"
import CommentReplyButton from "./actions/CommentReplyAction"
import type { CommentSurface } from "@/lib/comment-shared"

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
}: CommentFooterProps) {
  return (
    <div className="flex items-center justify-between mt-2">
      <CommentVote
        commentId={commentId}
        postId={postId}
        surface={surface}
        initialUpvotes={upvotes}
        initialDownvotes={downvotes}
        initialUserVote={userVote}
      />

      {canReply && (
        <CommentReplyButton
          onClick={onToggleReply}
          isActive={showReplyForm}
        />
      )}
    </div>
  )
}

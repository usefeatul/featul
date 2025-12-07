import React from "react"
import CommentVote from "./CommentVote"
import CommentReplyButton from "./actions/CommentReplyAction"
import { cn } from "@feedgot/ui/lib/utils"

interface CommentFooterProps {
  commentId: string
  postId: string
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
        initialUpvotes={upvotes}
        initialDownvotes={downvotes}
        initialUserVote={userVote}
      />

      {canReply && (
        <CommentReplyButton
          onClick={onToggleReply}
          isActive={showReplyForm}
          className={cn(
            "rounded-full border border-border px-3 py-1 h-auto transition-all duration-200 bg-transparent",
            showReplyForm
              ? "text-destructive hover:text-destructive"
              : "text-muted-foreground/70 hover:text-foreground"
          )}
        />
      )}
    </div>
  )
}

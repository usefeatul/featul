import React from "react"
import CommentVote from "./CommentVote"
import CommentReplyButton from "./actions/CommentReplyAction"
import { cn } from "@oreilla/ui/lib/utils"

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
            "rounded-full border border-border/50 px-3 py-1 h-[30px] transition-all duration-200 bg-muted/30",
            showReplyForm
              ? "text-destructive hover:text-destructive hover:bg-muted/50"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/50"
          )}
        />
      )}
    </div>
  )
}

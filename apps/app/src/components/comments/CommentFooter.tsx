import React from "react"
import Reactions from "./reactions"
import type { EmojiReaction } from "@featul/api/shared/reactions"
import CommentReplyButton from "./actions/CommentReplyAction"
import type { CommentSurface } from "@/lib/comment/shared"

interface CommentFooterProps {
  commentId: string
  postId: string
  surface?: CommentSurface
  reactions?: EmojiReaction[]
  canReply: boolean
  showReplyForm: boolean
  onToggleReply: () => void
  indentPx?: number
}

export default function CommentFooter({
  commentId,
  postId,
  surface = "workspace",
  reactions,
  canReply,
  showReplyForm,
  onToggleReply,
  indentPx = 0,
}: CommentFooterProps) {
  return (
    <div className="mt-2 flex items-center justify-between gap-2">
      <div style={{ paddingLeft: indentPx }}>
        <Reactions
          commentId={commentId}
          postId={postId}
          surface={surface}
          reactions={reactions}
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

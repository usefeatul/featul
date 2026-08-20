import React from "react"
import type { CommentData } from "../../types/comment"
import AnimatedReplies from "./AnimatedReplies"
import CommentItem from "./CommentItem"
import { updateCommentCollapseState } from "@/lib/comments.actions"
import type { CommentSurface } from "@/lib/comment/shared"
import { cn } from "@featul/ui/lib/utils"

interface CommentThreadProps {
  postId: string
  comments: CommentData[]
  currentUserId?: string | null
  onUpdate?: () => void
  workspaceSlug?: string
  surface?: CommentSurface
  initialCollapsedIds?: string[]
  hidePublicMemberIdentity?: boolean
}

export default function CommentThread({
  postId,
  comments,
  currentUserId,
  onUpdate,
  workspaceSlug,
  surface = "workspace",
  initialCollapsedIds = [],
  hidePublicMemberIdentity,
}: CommentThreadProps) {
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(
    new Set(initialCollapsedIds)
  )

  const toggleCollapse = async (commentId: string) => {
    const next = new Set(collapsedIds)
    const isCollapsed = !next.has(commentId)

    if (isCollapsed) {
      next.add(commentId)
    } else {
      next.delete(commentId)
    }
    setCollapsedIds(next)

    try {
      await updateCommentCollapseState(postId, commentId, isCollapsed)
    } catch (error) {
      console.error("Failed to update collapse state cookie", error)
    }
  }

  const rootComments = comments.filter((c) => !c.parentId)

  const getReplies = (parentId: string) =>
    comments
      .filter((c) => c.parentId === parentId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

  return (
    <div>
      {rootComments.map((comment) => (
        <ThreadItem
          key={comment.id}
          comment={comment}
          getReplies={getReplies}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
          collapsedIds={collapsedIds}
          onToggleCollapse={toggleCollapse}
          workspaceSlug={workspaceSlug}
          surface={surface}
          hidePublicMemberIdentity={hidePublicMemberIdentity}
        />
      ))}
    </div>
  )
}

// --- Thread Item ---

interface ThreadItemProps {
  comment: CommentData
  getReplies: (parentId: string) => CommentData[]
  currentUserId?: string | null
  onUpdate?: () => void
  depth?: number
  collapsedIds: Set<string>
  onToggleCollapse: (id: string) => void
  workspaceSlug?: string
  surface?: CommentSurface
  hidePublicMemberIdentity?: boolean
}

function ThreadItem({
  comment,
  getReplies,
  currentUserId,
  onUpdate,
  depth = 0,
  collapsedIds,
  onToggleCollapse,
  workspaceSlug,
  surface = "workspace",
  hidePublicMemberIdentity,
}: ThreadItemProps) {
  const replies = getReplies(comment.id)
  const isCollapsed = collapsedIds.has(comment.id)
  const hasReplies = replies.length > 0

  return (
    <div
      className={cn(
        "relative",
        depth === 0 &&
          "border-b border-border/60 last:border-b-0 dark:border-b-white/10",
      )}
    >
      <div className={cn(depth === 0 ? "px-4 py-3" : "py-2.5")}>
        <CommentItem
          comment={comment}
          currentUserId={currentUserId}
          onUpdate={onUpdate}
          onReplySuccess={onUpdate}
          depth={depth}
          hasReplies={hasReplies}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => onToggleCollapse(comment.id)}
          workspaceSlug={workspaceSlug}
          surface={surface}
          hidePublicMemberIdentity={hidePublicMemberIdentity}
        />
      </div>

      {hasReplies && (
        <AnimatedReplies isOpen={!isCollapsed}>
          <div className="ml-8 space-y-0 border-l border-border/50 pl-3 dark:border-white/10">
            {replies.map((reply) => (
              <ThreadItem
                key={reply.id}
                comment={reply}
                getReplies={getReplies}
                currentUserId={currentUserId}
                onUpdate={onUpdate}
                depth={depth + 1}
                collapsedIds={collapsedIds}
                onToggleCollapse={onToggleCollapse}
                workspaceSlug={workspaceSlug}
                surface={surface}
                hidePublicMemberIdentity={hidePublicMemberIdentity}
              />
            ))}
          </div>
        </AnimatedReplies>
      )}
    </div>
  )
}

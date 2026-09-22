import React from "react"
import type { CommentData } from "../../types/comment"
import AnimatedReplies from "./AnimatedReplies"
import CommentItem from "./CommentItem"
import { updateCommentCollapseState } from "@/lib/comments.actions"
import type { CommentSurface } from "@/lib/comment/shared"

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
  isLast?: boolean
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
  isLast = false,
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
    <div className="relative">
      {depth > 0 ? <>
        {!isLast ? <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1.5 top-0 border-l border-border/70 dark:border-white/15" /> : null}
        <span aria-hidden="true" className="pointer-events-none absolute left-1.5 top-0 h-7 w-2.5 rounded-bl-md border-b border-l border-border/70 dark:border-white/15" />
      </> : null}
      <div className="relative px-4 py-3">
        {hasReplies && !isCollapsed ? <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[30px] top-[42px] border-l border-border/70 dark:border-white/15" /> : null}
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
        <AnimatedReplies isOpen={!isCollapsed} className="ml-6">
          {replies.map((reply, index) => (
            <ThreadItem
              key={reply.id}
              comment={reply}
              getReplies={getReplies}
              currentUserId={currentUserId}
              onUpdate={onUpdate}
              depth={depth + 1}
              isLast={index === replies.length - 1}
              collapsedIds={collapsedIds}
              onToggleCollapse={onToggleCollapse}
              workspaceSlug={workspaceSlug}
              surface={surface}
              hidePublicMemberIdentity={hidePublicMemberIdentity}
            />
          ))}
        </AnimatedReplies>
      )}
    </div>
  )
}

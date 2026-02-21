import React from "react"
import type { CommentData } from "../../types/comment"
import AnimatedReplies from "./AnimatedReplies"
import CommentItem from "./CommentItem"
import { updateCommentCollapseState } from "@/lib/comments.actions"

interface CommentThreadProps {
  postId: string
  comments: CommentData[]
  currentUserId?: string | null
  onUpdate?: () => void
  workspaceSlug?: string
  surface?: "workspace" | "public"
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
    <div className="space-y-6">
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
  surface?: "workspace" | "public"
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
  const isOpen = hasReplies && !isCollapsed

  return (
    <div className="group/thread relative">
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

      {/* Vertical thread line */}
      {isOpen && <ThreadLine />}

      {/* Replies */}
      {hasReplies && (
        <AnimatedReplies isOpen={!isCollapsed}>
          <div className="relative pl-9 pt-2">
            <div className="space-y-4">
              {replies.map((reply, index) => (
                <ReplyWrapper
                  key={reply.id}
                  isLast={index === replies.length - 1}
                >
                  <ThreadItem
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
                </ReplyWrapper>
              ))}
            </div>
          </div>
        </AnimatedReplies>
      )}
    </div>
  )
}

// --- Thread Decorators ---

function ThreadLine() {
  return (
    <div
      className="absolute left-[15px] top-8 bottom-0 w-px bg-border/50 transition-colors"
      aria-hidden="true"
    />
  )
}

function ReplyWrapper({
  isLast,
  children,
}: {
  isLast: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {/* Curved connector */}
      <div className="absolute -left-[21px] top-[14px] size-[18px] rounded-bl-xl border-l border-b border-border/50 transition-colors" />

      {/* Mask vertical line at last item */}
      {isLast && (
        <div className="absolute -left-[21px] top-[14px] bottom-0 w-px bg-background z-10" />
      )}

      {children}
    </div>
  )
}

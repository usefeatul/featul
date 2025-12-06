"use client"

import React, { useEffect, useMemo, useState } from "react"
import CommentItem, { CommentData } from "./CommentItem"

import { cn } from "@feedgot/ui/lib/utils"
import AnimatedReplies from "./AnimatedReplies"
import { encodeCollapsedIds } from "@/lib/comments"

interface CommentThreadProps {
  postId: string
  comments: CommentData[]
  currentUserId?: string | null
  onUpdate?: () => void
  workspaceSlug?: string
  initialCollapsedIds?: string[]
}

export default function CommentThread({ postId, comments, currentUserId, onUpdate, workspaceSlug, initialCollapsedIds }: CommentThreadProps) {
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(() => new Set(initialCollapsedIds || []))

  const toggleCollapse = (commentId: string) => {
    setCollapsedComments((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  useEffect(() => {
    try {
      const encoded = encodeCollapsedIds(collapsedComments)
      document.cookie = `cmc:${postId}=${encoded}; path=/; max-age=31536000`
    } catch {}
  }, [collapsedComments, postId])
  // Build a tree structure from flat comments list
  const buildCommentTree = (comments: CommentData[]) => {
    const commentMap = new Map<string, CommentData & { replies: CommentData[] }>()
    const rootComments: (CommentData & { replies: CommentData[] })[] = []

    // First pass: create map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: build tree structure
    comments.forEach((comment) => {
      const node = commentMap.get(comment.id)!
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId)
        if (parent) {
          parent.replies.push(node)
        } else {
          // Parent not found, treat as root
          rootComments.push(node)
        }
      } else {
        rootComments.push(node)
      }
    })

    // Sort root comments: pinned first, then by date
    rootComments.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    // Sort replies by date (oldest first for natural conversation flow)
    const sortReplies = (node: CommentData & { replies: CommentData[] }) => {
      node.replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      node.replies.forEach((reply) => {
        if ('replies' in reply && Array.isArray(reply.replies)) {
          sortReplies(reply as CommentData & { replies: CommentData[] })
        }
      })
    }
    rootComments.forEach(sortReplies)

    return rootComments
  }

  const renderComment = (
    comment: CommentData & { replies: CommentData[] },
    depth: number = 0
  ): React.ReactNode => {
    const isCollapsed = collapsedComments.has(comment.id)
    const hasReplies = comment.replies.length > 0

    return (
      <div key={comment.id} className={cn("space-y-3", depth === 0 && "py-4 border-b border-border/40 last:border-0")}>
        <CommentItem
          comment={comment}
          currentUserId={currentUserId}
          onReplySuccess={onUpdate}
          onUpdate={onUpdate}
          depth={depth}
          hasReplies={hasReplies}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => toggleCollapse(comment.id)}
          workspaceSlug={workspaceSlug}
        />
        {hasReplies ? (
          <AnimatedReplies isOpen={!isCollapsed} className="ml-4 pl-4 pt-2 space-y-4 border-l border-border/60">
            {comment.replies.map((reply) => renderComment(reply as CommentData & { replies: CommentData[] }, depth + 1))}
          </AnimatedReplies>
        ) : null}
      </div>
    )
  }

  const commentTree = buildCommentTree(comments)

  return (
    <div className="space-y-4">
      {commentTree.map((comment) => renderComment(comment, 0))}
    </div>
  )
}

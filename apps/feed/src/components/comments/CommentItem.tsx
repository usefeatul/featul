"use client"

import React, { useState, useTransition } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { Button } from "@feedgot/ui/components/button"
import { Textarea } from "@feedgot/ui/components/textarea"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { MessageSquare, Heart, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@feedgot/ui/lib/utils"
import CommentForm from "./CommentForm"
import CommentImage from "./CommentImage"
import CommentActions from "./CommentActions"

export type CommentData = {
  id: string
  postId: string
  parentId: string | null
  content: string
  authorId: string | null
  authorName: string
  authorEmail: string | null
  authorImage: string
  isAnonymous: boolean | null
  status: string
  upvotes: number
  replyCount: number
  depth: number
  isPinned: boolean | null
  isEdited: boolean | null
  createdAt: string
  updatedAt: string
  editedAt: string | null
  hasVoted?: boolean
  metadata?: {
    attachments?: { name: string; url: string; type: string }[]
    mentions?: string[]
    editHistory?: { content: string; editedAt: string }[]
  } | null
}

interface CommentItemProps {
  comment: CommentData
  currentUserId?: string | null
  onReplySuccess?: () => void
  onUpdate?: () => void
  depth?: number
  hasReplies?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
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
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [upvotes, setUpvotes] = useState(comment.upvotes)
  const [hasVoted, setHasVoted] = useState(comment.hasVoted || false)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = currentUserId && comment.authorId === currentUserId
  const canReply = depth < 3 // Limit nesting to 3 levels

  // Sync state with prop changes (e.g., on page refresh)
  React.useEffect(() => {
    setUpvotes(comment.upvotes)
    setHasVoted(comment.hasVoted || false)
  }, [comment.upvotes, comment.hasVoted])

  const handleUpvote = () => {
    const previousUpvotes = upvotes
    const previousHasVoted = hasVoted
    const nextHasVoted = !hasVoted
    const nextUpvotes = nextHasVoted ? upvotes + 1 : upvotes - 1

    setHasVoted(nextHasVoted)
    setUpvotes(nextUpvotes)

    startTransition(async () => {
      try {
        const res = await client.comment.upvote.$post({ commentId: comment.id })
        if (res.ok) {
          const data = await res.json()
          setUpvotes(data.upvotes)
          setHasVoted(data.hasVoted)
        } else {
          setUpvotes(previousUpvotes)
          setHasVoted(previousHasVoted)
          if (res.status === 401) toast.error("Please sign in to vote")
        }
      } catch (error) {
        setUpvotes(previousUpvotes)
        setHasVoted(previousHasVoted)
        console.error("Failed to vote:", error)
      }
    })
  }

  const handleEdit = () => {
    if (!editContent.trim() || isPending) return

    startTransition(async () => {
      try {
        const res = await client.comment.update.$post({
          commentId: comment.id,
          content: editContent.trim(),
        })

        if (res.ok) {
          setIsEditing(false)
          toast.success("Comment updated")
          onUpdate?.()
        } else {
          toast.error("Failed to update comment")
        }
      } catch (error) {
        console.error("Failed to update comment:", error)
        toast.error("Failed to update comment")
      }
    })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    startTransition(async () => {
      try {
        const res = await client.comment.delete.$post({ commentId: comment.id })
        if (res.ok) {
          toast.success("Comment deleted")
          onUpdate?.()
        } else {
          toast.error("Failed to delete comment")
          setIsDeleting(false)
        }
      } catch (error) {
        console.error("Failed to delete comment:", error)
        toast.error("Failed to delete comment")
        setIsDeleting(false)
      }
    })
  }

  const handleReport = () => {
    startTransition(async () => {
      try {
        const res = await client.comment.report.$post({
          commentId: comment.id,
          reason: "spam",
        })
        if (res.ok) {
          toast.success("Comment reported")
        } else if (res.status === 401) {
          toast.error("Please sign in to report")
        } else {
          toast.error("Failed to report comment")
        }
      } catch (error) {
        console.error("Failed to report comment:", error)
        toast.error("Failed to report comment")
      }
    })
  }

  const relativeTime = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(past)
  }

  const initials = comment.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (isDeleting) {
    return (
      <div className="flex gap-3 opacity-50">
        <div className="flex-1 text-xs text-muted-foreground">Comment deleted</div>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-2.5", depth > 0 && "py-1.5")}>
      <Avatar className="h-7 w-7 flex-shrink-0 mt-0.5">
        <AvatarImage src={comment.authorImage} alt={comment.authorName} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium">{comment.authorName}</span>
            <span className="text-xs text-muted-foreground">{relativeTime(comment.createdAt)}</span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
            {comment.isPinned && (
              <span className="text-xs text-primary">Pinned</span>
            )}
            {hasReplies && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    <span>{comment.replyCount}</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    <span>{comment.replyCount}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                disabled={isPending}
              />
              <div className="flex items-center gap-2">
                <Button size="xs" variant="nav" onClick={handleEdit} disabled={!editContent.trim() || isPending}>
                  {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Save
                </Button>
                <Button
                  size="xs"
                  variant="nav"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {comment.content && (
                <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                  {comment.content}
                </p>
              )}
              {/* Display images from metadata */}
              {comment.metadata?.attachments && comment.metadata.attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {comment.metadata.attachments
                    .filter((att) => att.type.startsWith("image/"))
                    .map((att, idx) => (
                      <CommentImage
                        key={idx}
                        url={att.url}
                        alt={att.name}
                        size="small"
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleUpvote}
              disabled={isPending}
              className={cn(
                "inline-flex items-center gap-1 text-xs transition-colors cursor-pointer",
                hasVoted ? "text-red-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", hasVoted && "fill-current")} />
              {upvotes > 0 && <span className="tabular-nums">{upvotes}</span>}
            </button>

            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Reply
              </button>
            )}

            <CommentActions
              isAuthor={!!isAuthor}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
              onReport={handleReport}
            />
          </div>
        )}

        {showReplyForm && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="rounded-md bg-muted/50 p-3">
              <CommentForm
                postId={comment.postId}
                parentId={comment.id}
                onSuccess={() => {
                  setShowReplyForm(false)
                  onReplySuccess?.()
                }}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
                autoFocus
                buttonText="Reply"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


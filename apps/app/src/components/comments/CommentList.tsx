import React from "react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import CommentForm from "./CommentForm"
import CommentThread from "./CommentThread"
import { useSession } from "@featul/auth/client"
import type { CommentData } from "../../types/comment"
import { getBrowserFingerprint } from "@/utils/fingerprint"
import { useEffect, useState } from "react"
import CommentsDisabledState from "./CommentsDisabledState"
import {
  getCommentsQueryKey,
  toCommentListResponse,
  type CommentListResponse,
  type CommentSurface,
} from "@/lib/comment-shared"

interface CommentListProps {
  postId: string
  initialCount?: number
  workspaceSlug?: string
  surface?: CommentSurface
  allowComments?: boolean
  initialComments?: CommentData[]
  initialCollapsedIds?: string[]
  hidePublicMemberIdentity?: boolean
}

export default function CommentList({
  postId,
  initialCount = 0,
  workspaceSlug,
  surface = "workspace",
  allowComments = true,
  initialComments,
  initialCollapsedIds,
  hidePublicMemberIdentity,
}: CommentListProps) {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id || null
  const [fingerprint, setFingerprint] = useState<string | null>(null)

  useEffect(() => {
    getBrowserFingerprint().then(setFingerprint)
  }, [])

  const queryKey = getCommentsQueryKey(postId, surface)

  const { data: commentsData, isLoading, refetch } = useQuery<CommentListResponse>({
    queryKey,
    queryFn: async () => {
      const res = await client.comment.list.$get({
        postId,
        fingerprint: fingerprint || undefined,
        surface,
      })
      if (!res.ok) {
        throw new Error("Failed to fetch comments")
      }
      return toCommentListResponse(await res.json())
    },
    staleTime: 30_000,
    gcTime: 300_000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: initialComments ? { comments: initialComments } : undefined,
    enabled: allowComments,
  })

  const comments = commentsData?.comments || []
  const commentCount = comments.length

  const handleCommentSuccess = () => {
    refetch()
  }

  if (!allowComments) {
    return <CommentsDisabledState />
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-background dark:bg-background p-3.5">
        <CommentForm
          postId={postId}
          onSuccess={handleCommentSuccess}
          workspaceSlug={workspaceSlug}
          surface={surface}
        />
      </div>
      {commentCount === 0 && !isLoading ? (
        <div className="p-6 text-center">
          <p className="text-sm text-accent">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative">
          {comments.length > 0 && (
            <CommentThread
              postId={postId}
              comments={comments}
              currentUserId={currentUserId}
              onUpdate={handleCommentSuccess}
              workspaceSlug={workspaceSlug}
              surface={surface}
              initialCollapsedIds={initialCollapsedIds}
              hidePublicMemberIdentity={hidePublicMemberIdentity}
            />
          )}
        </div>
      )}
    </div>
  )
}

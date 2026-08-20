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
} from "@/lib/comment/shared"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"
import { cn } from "@featul/ui/lib/utils"

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
  initialCount: _initialCount = 0,
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
      <div className={settingsCardShellClass}>
        <header className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="mt-0.5 text-sm font-medium leading-none text-foreground">
              Comments
            </h2>
          </div>
          <div className="flex w-full shrink-0 items-center justify-end sm:w-auto sm:pl-4">
            <span className="text-xs tabular-nums text-accent">
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </span>
          </div>
        </header>
        <div className={settingsCardInnerClass}>
          <CommentForm
            postId={postId}
            onSuccess={handleCommentSuccess}
            workspaceSlug={workspaceSlug}
            surface={surface}
          />
        </div>
        {commentCount === 0 && !isLoading ? (
          <div className={cn(settingsCardInnerClass, "mt-2 py-8 text-center")}>
            <p className="text-sm text-accent">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : null}
      </div>
      {commentCount > 0 ? (
        <div className="relative space-y-4">
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
        </div>
      ) : null}
    </div>
  )
}

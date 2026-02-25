"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { CommentsIcon } from "@featul/ui/icons/comments"
import { cn } from "@featul/ui/lib/utils"
import {
  COMMENT_CREATED_EVENT,
  COMMENT_DELETED_EVENT,
  getCommentsQueryKey,
  toCommentListResponse,
  type CommentCreatedEventDetail,
  type CommentDeletedEventDetail,
  type CommentListResponse,
  type CommentSurface,
} from "@/lib/comment-shared"

interface CommentCounterProps {
  postId: string
  initialCount?: number
  surface?: CommentSurface
  className?: string
}

export default function CommentCounter({
  postId,
  initialCount = 0,
  surface = "workspace",
  className,
}: CommentCounterProps) {
  const { data: commentsData } = useQuery<CommentListResponse>({
    queryKey: getCommentsQueryKey(postId, surface),
    // Subscribe to cache without triggering a fetch from this component
    enabled: false,
    queryFn: async () => {
      const res = await client.comment.list.$get({ postId, surface })
      if (!res.ok) throw new Error("Failed to fetch comments")
      return toCommentListResponse(await res.json())
    },
    staleTime: 30_000,
    gcTime: 300_000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const [delta, setDelta] = React.useState(0)
  const prevBaseRef = React.useRef<number>(initialCount)

  React.useEffect(() => {
    const onCreated = (e: Event) => {
      const detail = (e as CustomEvent<CommentCreatedEventDetail>).detail
      if (!detail) return
      const eventSurface = detail.surface || "workspace"
      if (
        detail.postId === postId &&
        eventSurface === surface &&
        !detail.parentId
      ) {
        setDelta((d) => d + 1)
      }
    }
    const onDeleted = (e: Event) => {
      const detail = (e as CustomEvent<CommentDeletedEventDetail>).detail
      if (!detail) return
      const eventSurface = detail.surface || "workspace"
      if (detail.postId === postId && eventSurface === surface) {
        setDelta((d) => Math.max(0, d - 1))
      }
    }
    window.addEventListener(COMMENT_CREATED_EVENT, onCreated)
    window.addEventListener(COMMENT_DELETED_EVENT, onDeleted)
    return () => {
      window.removeEventListener(COMMENT_CREATED_EVENT, onCreated)
      window.removeEventListener(COMMENT_DELETED_EVENT, onDeleted)
    }
  }, [postId, surface])

  const baseCount = commentsData?.comments.length ?? initialCount
  const count = Math.max(0, baseCount + delta)

  React.useEffect(() => {
    if (baseCount !== prevBaseRef.current) {
      prevBaseRef.current = baseCount
      setDelta(0)
    }
  }, [baseCount])

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <CommentsIcon aria-hidden className="size-3" />
      <span className="tabular-nums">{count}</span>
    </span>
  )
}

"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { CommentsIcon } from "@oreilla/ui/icons/comments"
import { cn } from "@oreilla/ui/lib/utils"

interface CommentCounterProps {
  postId: string
  initialCount?: number
  className?: string
}

export default function CommentCounter({ postId, initialCount = 0, className }: CommentCounterProps) {
  const { data: commentsData } = useQuery({
    queryKey: ["comments", postId],
    // Subscribe to cache without triggering a fetch from this component
    enabled: false,
    queryFn: async () => {
      const res = await client.comment.list.$get({ postId })
      if (!res.ok) throw new Error("Failed to fetch comments")
      return await res.json()
    },
    staleTime: 30_000,
    gcTime: 300_000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  }) as any

  const [delta, setDelta] = React.useState(0)
  const prevBaseRef = React.useRef<number>(initialCount)

  React.useEffect(() => {
    const onCreated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { postId: string; parentId?: string | null }
      if (detail?.postId === postId && !detail?.parentId) {
        setDelta((d) => d + 1)
      }
    }
    const onDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail as { postId: string }
      if (detail?.postId === postId) {
        setDelta((d) => Math.max(0, d - 1))
      }
    }
    window.addEventListener("comment:created", onCreated)
    window.addEventListener("comment:deleted", onDeleted)
    return () => {
      window.removeEventListener("comment:created", onCreated)
      window.removeEventListener("comment:deleted", onDeleted)
    }
  }, [postId])

  const baseCount = (commentsData?.comments?.length ?? initialCount) as number
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

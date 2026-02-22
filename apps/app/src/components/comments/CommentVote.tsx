"use client"

import React, { useState, useTransition } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { cn } from "@featul/ui/lib/utils"
import { Button } from "@featul/ui/components/button"
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getBrowserFingerprint } from "@/utils/fingerprint"
import {
  getCommentsQueryKey,
  toCommentListResponse,
  type CommentListResponse,
  type CommentSurface,
} from "@/lib/comment-shared"

interface CommentVoteProps {
  commentId: string
  postId: string
  surface?: CommentSurface
  initialUpvotes: number
  initialDownvotes: number
  initialUserVote?: "upvote" | "downvote" | null
}

export default function CommentVote({ 
  commentId, 
  postId, 
  surface = "workspace",
  initialUpvotes, 
  initialDownvotes,
  initialUserVote 
}: CommentVoteProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isPending, startTransition] = useTransition()
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    getBrowserFingerprint().then(setVisitorId)
  }, [])

  const { data: commentsData } = useQuery<CommentListResponse>({
    queryKey: getCommentsQueryKey(postId, surface),
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

  React.useEffect(() => {
    setUpvotes(initialUpvotes)
    setDownvotes(initialDownvotes)
    setUserVote(initialUserVote)
  }, [initialUpvotes, initialDownvotes, initialUserVote])

  React.useEffect(() => {
    const target = commentsData?.comments.find((c) => c.id === commentId)
    if (target) {
      setUpvotes(target.upvotes)
      setDownvotes(target.downvotes)
      setUserVote(target.userVote)
    }
  }, [commentsData, commentId])

  const { data: statusData } = useQuery<{
    upvotes: number
    downvotes: number
    userVote: "upvote" | "downvote" | null
  } | null>({
    queryKey: ["comment-vote-status", postId, commentId, visitorId, surface],
    enabled: !!visitorId,
    queryFn: async () => {
      const res = await client.comment.list.$get({ postId, fingerprint: visitorId || undefined, surface })
      if (!res.ok) return null
      const json = toCommentListResponse(await res.json())
      const found = json.comments.find((c) => c.id === commentId)
      return found ? { 
        upvotes: found.upvotes, 
        downvotes: found.downvotes,
        userVote: found.userVote ?? null,
      } : null
    },
    staleTime: 10_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 300_000,
  })

  React.useEffect(() => {
    if (statusData) {
      setUpvotes(statusData.upvotes)
      setDownvotes(statusData.downvotes)
      setUserVote(statusData.userVote)
    }
  }, [statusData])

  const handleVote = (type: "upvote" | "downvote") => {
    const previousUpvotes = upvotes
    const previousDownvotes = downvotes
    const previousUserVote = userVote

    // Optimistic update
    if (userVote === type) {
      // Toggle off
      setUserVote(null)
      if (type === "upvote") setUpvotes(Math.max(0, upvotes - 1))
      else setDownvotes(Math.max(0, downvotes - 1))
    } else {
      // Switch vote or new vote
      if (userVote === "upvote") setUpvotes(Math.max(0, upvotes - 1))
      if (userVote === "downvote") setDownvotes(Math.max(0, downvotes - 1))
      
      setUserVote(type)
      if (type === "upvote") setUpvotes(upvotes + 1)
      else setDownvotes(downvotes + 1)
    }

    startTransition(async () => {
      try {
        const res = await client.comment.vote.$post({ 
          commentId,
          voteType: type,
          fingerprint: visitorId || undefined 
        })
        if (res.ok) {
          const data = await res.json()
          setUpvotes(data.upvotes)
          setDownvotes(data.downvotes)
          setUserVote(data.userVote)

          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {
            // ignore
          }
        } else {
          // Revert on error
          setUpvotes(previousUpvotes)
          setDownvotes(previousDownvotes)
          setUserVote(previousUserVote)
          if (res.status === 401) toast.error("Please sign in to vote")
        }
      } catch (error) {
        setUpvotes(previousUpvotes)
        setDownvotes(previousDownvotes)
        setUserVote(previousUserVote)
        console.error("Failed to vote:", error)
      }
    })
  }

  return (
    <Toolbar size="sm" variant="plain" className="h-8 bg-card dark:bg-black/50 border-border">
      <Button
        type="button"
        variant="plain"
        size="xs"
        onClick={() => handleVote("upvote")}
        disabled={isPending}
        className={cn(
          "h-8 min-w-[58px] px-1.5 gap-1.5 rounded-none border-0 shadow-none bg-transparent dark:bg-transparent hover:bg-muted/20 dark:hover:bg-black/30",
          userVote === "upvote"
            ? "text-green-600 dark:text-green-400"
            : "text-accent hover:text-foreground"
        )}
        title="Upvote"
      >
        <ThumbsUp className={cn("size-3.5", userVote === "upvote" && "fill-current")} />
        <AnimatePresence initial={false} mode="popLayout">
          {upvotes > 0 && (
            <motion.span
              key={upvotes}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="font-medium tabular-nums pr-1"
            >
              {upvotes}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <ToolbarSeparator />

      <Button
        type="button"
        variant="plain"
        size="xs"
        onClick={() => handleVote("downvote")}
        disabled={isPending}
        className={cn(
          "h-8 min-w-[48px] px-1.5 gap-1.5 rounded-none border-0 shadow-none bg-transparent dark:bg-transparent hover:bg-muted/20 dark:hover:bg-black/30",
          userVote === "downvote"
            ? "text-red-600 dark:text-red-400"
            : "text-accent hover:text-foreground"
        )}
        title="Downvote"
      >
        <ThumbsDown className={cn("size-3.5", userVote === "downvote" && "fill-current")} />
        <AnimatePresence initial={false} mode="popLayout">
          {downvotes > 0 && (
            <motion.span
              key={downvotes}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="font-medium tabular-nums pr-1"
            >
              {downvotes}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </Toolbar>
  )
}

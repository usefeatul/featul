"use client"

import React, { useState, useTransition } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { cn } from "@feedgot/ui/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { getBrowserFingerprint } from "@/utils/fingerprint"

interface CommentVoteProps {
  commentId: string
  postId: string
  initialUpvotes: number
  initialDownvotes: number
  initialUserVote?: "upvote" | "downvote" | null
}

export default function CommentVote({ 
  commentId, 
  postId, 
  initialUpvotes, 
  initialDownvotes,
  initialUserVote 
}: CommentVoteProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [downvotes, setDownvotes] = useState(initialDownvotes)
  const [userVote, setUserVote] = useState(initialUserVote)
  const [isPending, startTransition] = useTransition()
  const [visitorId, setVisitorId] = useState<string | null>(null)

  React.useEffect(() => {
    getBrowserFingerprint().then(setVisitorId)
  }, [])

  const { data: commentsData } = useQuery({
    queryKey: ["comments", postId],
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

  React.useEffect(() => {
    setUpvotes(initialUpvotes)
    setDownvotes(initialDownvotes)
    setUserVote(initialUserVote)
  }, [initialUpvotes, initialDownvotes, initialUserVote])

  React.useEffect(() => {
    const target = commentsData?.comments?.find((c: any) => c.id === commentId)
    if (target) {
      setUpvotes(target.upvotes)
      setDownvotes(target.downvotes)
      setUserVote(target.userVote)
    }
  }, [commentsData, commentId])

  const { data: statusData } = useQuery({
    queryKey: ["comment-vote-status", postId, commentId, visitorId],
    enabled: !!visitorId,
    queryFn: async () => {
      const res = await client.comment.list.$get({ postId, fingerprint: visitorId || undefined })
      if (!res.ok) return null
      const json = await res.json()
      const found = json?.comments?.find((c: any) => c.id === commentId)
      return found ? { 
        upvotes: found.upvotes, 
        downvotes: found.downvotes,
        userVote: found.userVote 
      } : null
    },
    staleTime: 10_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 300_000,
  }) as any

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
    <div className="flex items-center gap-1 bg-muted/30 rounded-full p-1 border border-border/50">
      <button
        onClick={() => handleVote("upvote")}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer p-1 rounded-full hover:bg-muted",
          userVote === "upvote" ? "text-green-600" : "text-muted-foreground"
        )}
        title="Upvote"
      >
        <ThumbsUp className={cn("h-3.5 w-3.5", userVote === "upvote" && "fill-current")} />
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
      </button>

      <div className="w-px h-3 bg-border/50" />

      <button
        onClick={() => handleVote("downvote")}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer p-1 rounded-full hover:bg-muted",
          userVote === "downvote" ? "text-red-600" : "text-muted-foreground"
        )}
        title="Downvote"
      >
        <ThumbsDown className={cn("h-3.5 w-3.5", userVote === "downvote" && "fill-current")} />
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
      </button>
    </div>
  )
}

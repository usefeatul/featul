"use client"

import React, { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { cn } from "@feedgot/ui/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"

interface CommentVoteProps {
  commentId: string
  postId: string
  initialUpvotes: number
  initialHasVoted: boolean
}

export default function CommentVote({ commentId, postId, initialUpvotes, initialHasVoted }: CommentVoteProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [isPending, startTransition] = useTransition()
  const [burstId, setBurstId] = useState(0)
  const prevVotedRef = React.useRef<boolean>(initialHasVoted)

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
    setHasVoted(initialHasVoted)
    prevVotedRef.current = initialHasVoted
  }, [initialUpvotes, initialHasVoted])

  React.useEffect(() => {
    const target = commentsData?.comments?.find((c: any) => c.id === commentId)
    if (target) {
      setUpvotes(target.upvotes)
      setHasVoted(!!target.hasVoted)
    }
  }, [commentsData, commentId])

  const { data: statusData } = useQuery({
    queryKey: ["comment-vote-status", postId, commentId],
    enabled: true,
    queryFn: async () => {
      const res = await client.comment.list.$get({ postId })
      if (!res.ok) return null
      const json = await res.json()
      const found = json?.comments?.find((c: any) => c.id === commentId)
      return found ? { upvotes: found.upvotes, hasVoted: !!found.hasVoted } : null
    },
    staleTime: 10_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 300_000,
  }) as any

  React.useEffect(() => {
    if (statusData) {
      setUpvotes(statusData.upvotes)
      setHasVoted(statusData.hasVoted)
    }
  }, [statusData])


  const handleUpvote = () => {
    const previousUpvotes = upvotes
    const previousHasVoted = hasVoted
    const nextHasVoted = !hasVoted
    const nextUpvotes = nextHasVoted ? upvotes + 1 : upvotes - 1

    setHasVoted(nextHasVoted)
    setUpvotes(nextUpvotes)


    if (nextHasVoted) {
      setBurstId((id) => id + 1)
      window.setTimeout(() => setBurstId(0), 600)
    } else {
      setBurstId(0)
    }

    startTransition(async () => {
      try {
        const res = await client.comment.upvote.$post({ commentId })
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

  return (
    <button
      onClick={handleUpvote}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/vote border border-border rounded-full px-2 py-1",
        hasVoted ? "text-red-500" : "text-muted-foreground/70 hover:text-red-500/80"
      )}
    >
      <span className="relative inline-flex items-center">
        <motion.span
          key={hasVoted ? "liked" : "unliked"}
          animate={{
            scale: hasVoted ? [1, 1.2, 1] : [1, 0.95, 1],
            rotate: hasVoted ? [0, -6, 0] : 0,
          }}
          transition={{ duration: 0.25 }}
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5",
              hasVoted ? "fill-current" : "group-hover/vote:scale-110 transition-transform"
            )}
            fill={hasVoted ? "currentColor" : "none"}
          />
        </motion.span>
        <AnimatePresence>
          {burstId > 0 && hasVoted && (
            <motion.span
              key={`burst-${burstId}`}
              className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-red-500/25"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              aria-hidden
            />
          )}
          {burstId > 0 && hasVoted && (
            <motion.span
              key={`burst-2-${burstId}`}
              className="absolute -top-0.5 -left-0.5 h-7 w-7 rounded-full bg-red-500/15"
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2.3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              aria-hidden
            />
          )}
        </AnimatePresence>
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        {upvotes > 0 && (
          <motion.span
            key={upvotes}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="tabular-nums font-medium"
          >
            {upvotes}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

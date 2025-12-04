"use client"

import React, { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { cn } from "@feedgot/ui/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface CommentVoteProps {
  commentId: string
  initialUpvotes: number
  initialHasVoted: boolean
}

export default function CommentVote({ commentId, initialUpvotes, initialHasVoted }: CommentVoteProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [isPending, startTransition] = useTransition()
  const [burstId, setBurstId] = useState(0)
  const prevVotedRef = React.useRef<boolean>(initialHasVoted)

  React.useEffect(() => {
    setUpvotes(initialUpvotes)
    setHasVoted(initialHasVoted)
    prevVotedRef.current = initialHasVoted
  }, [initialUpvotes, initialHasVoted])

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
        "inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/vote",
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
            className={cn("h-3.5 w-3.5", !hasVoted && "group-hover/vote:scale-110 transition-transform")}
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

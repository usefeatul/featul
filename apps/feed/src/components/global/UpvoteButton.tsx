"use client"

import React, { useState, useTransition } from "react"
import { LoveIcon } from "@feedgot/ui/icons/love"
import { cn } from "@feedgot/ui/lib/utils"
import { client } from "@feedgot/api/client"


interface UpvoteButtonProps {
  postId: string
  upvotes: number
  hasVoted?: boolean
  className?: string
}

export function UpvoteButton({ postId, upvotes: initialUpvotes, hasVoted: initialHasVoted, className }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasVoted, setHasVoted] = useState(initialHasVoted || false)
  const [isPending, startTransition] = useTransition()

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Optimistic update
    const previousUpvotes = upvotes
    const previousHasVoted = hasVoted
    
    setHasVoted(!hasVoted)
    setUpvotes(hasVoted ? upvotes - 1 : upvotes + 1)

    startTransition(async () => {
      try {
        const res = await client.post.vote.$post({ postId })
        if (res.ok) {
          const data = await res.json()
          setUpvotes(data.upvotes)
          setHasVoted(data.hasVoted)
        }
      } catch (error) {
        // Revert on error
        setUpvotes(previousUpvotes)
        setHasVoted(previousHasVoted)
        console.error("Failed to vote:", error)
      }
    })
  }

  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1 group transition-colors",
        hasVoted ? "text-red-500" : "text-muted-foreground hover:text-red-500/80",
        className
      )}
    >
      <LoveIcon 
        className={cn("w-3 h-3 transition-colors", hasVoted ? "fill-current" : "")} 
      />
      <span className="tabular-nums">{upvotes}</span>
    </button>
  )
}

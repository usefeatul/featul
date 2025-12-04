"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@feedgot/ui/lib/utils";
import { client } from "@feedgot/api/client";
import { toast } from "sonner";

interface UpvoteButtonProps {
  postId: string;
  upvotes: number;
  hasVoted?: boolean;
  className?: string;
  activeBg?: boolean;
  onChange?: (v: { upvotes: number; hasVoted: boolean }) => void;
}

export function UpvoteButton({
  postId,
  upvotes: initialUpvotes,
  hasVoted: initialHasVoted,
  className,
  activeBg = false,
  onChange,
}: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted || false);
  const [isPending, startTransition] = useTransition();

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Optimistic update
    const previousUpvotes = upvotes;
    const previousHasVoted = hasVoted;
    const nextHasVoted = !hasVoted;
    const nextUpvotes = nextHasVoted ? upvotes + 1 : upvotes - 1;
    setHasVoted(nextHasVoted);
    setUpvotes(nextUpvotes);
    if (onChange) onChange({ upvotes: nextUpvotes, hasVoted: nextHasVoted });
    startTransition(async () => {
      try {
        const res = await client.post.vote.$post({ postId });
        if (res.ok) {
          const data = await res.json();
          setUpvotes(data.upvotes);
          setHasVoted(data.hasVoted);
          if (onChange) onChange({ upvotes: data.upvotes, hasVoted: data.hasVoted });
        } else {
          setUpvotes(previousUpvotes);
          setHasVoted(previousHasVoted);
          if (onChange) onChange({ upvotes: previousUpvotes, hasVoted: previousHasVoted });
          if (res.status === 401) toast.error("Please sign in to vote");
        }
      } catch (error) {
        setUpvotes(previousUpvotes);
        setHasVoted(previousHasVoted);
        if (onChange) onChange({ upvotes: previousUpvotes, hasVoted: previousHasVoted });
        console.error("Failed to vote:", error);
      }
    });
  };

  return (
    <motion.button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/vote",
        hasVoted ? "text-red-500" : "text-muted-foreground/70 hover:text-red-500/80",
        className
      )}
      whileTap={{ scale: 0.97 }}
      aria-pressed={hasVoted}
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
          {hasVoted && (
            <motion.span
              key="burst"
              className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-red-500/25"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              aria-hidden
            />
          )}
          {hasVoted && (
            <motion.span
              key="burst-2"
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
      </AnimatePresence>
    </motion.button>
  );
}

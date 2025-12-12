"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@oreilla/ui/lib/utils";
import { useUpvote } from "../../hooks/useUpvote";
import { VoteIcon } from "./VoteIcon";
import { VoteCount } from "./VoteCount";

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
  const { upvotes, hasVoted, isPending, handleVote } = useUpvote({
    postId,
    initialUpvotes,
    initialHasVoted,
    onChange,
  });

  return (
    <motion.button
      onClick={handleVote}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer group/vote",
        hasVoted
          ? "text-red-500"
          : "text-muted-foreground/70 hover:text-red-500/80",
        className
      )}
      whileTap={{ scale: 0.97 }}
      aria-pressed={hasVoted}
    >
      <VoteIcon hasVoted={hasVoted} />
      <VoteCount upvotes={upvotes} />
    </motion.button>
  );
}

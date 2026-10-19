"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { useUpvote } from "../../hooks/useUpvote";
import { VoteIcon } from "./VoteIcon";
import { VoteCount } from "./VoteCount";

interface UpvoteButtonProps {
  postId: string;
  upvotes: number;
  hasVoted?: boolean;
  className?: string;
  onChange?: (v: { upvotes: number; hasVoted: boolean }) => void;
}

export function UpvoteButton({
  postId,
  upvotes: initialUpvotes,
  hasVoted: initialHasVoted,
  className,
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
        "inline-flex cursor-pointer items-center gap-1.5 rounded-md text-xs text-muted-foreground/70 transition-colors group/vote hover:text-primary",
        className,
        hasVoted &&
          "border-primary/60 bg-primary from-[color-mix(in_oklab,var(--primary),black_4%)] to-[color-mix(in_oklab,var(--primary),black_16%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_1px_rgba(0,0,0,0.12)] hover:bg-primary/90 hover:text-white hover:brightness-110 dark:border-primary/60 dark:bg-primary dark:from-[color-mix(in_oklab,var(--primary),black_4%)] dark:to-[color-mix(in_oklab,var(--primary),black_16%)] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_1px_rgba(0,0,0,0.12)] dark:hover:bg-primary/90 dark:hover:text-white",
      )}
      whileTap={{ scale: 0.97 }}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? "Remove upvote" : "Upvote"}
    >
      <VoteIcon hasVoted={hasVoted} />
      <VoteCount upvotes={upvotes} />
    </motion.button>
  );
}

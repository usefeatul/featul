"use client";

import React from "react";
import { motion } from "framer-motion";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { useUpvote } from "../../hooks/useUpvote";
import { VoteIcon } from "./VoteIcon";
import { VoteCount } from "./VoteCount";

interface UpvoteButtonProps {
  postId: string;
  upvotes: number;
  hasVoted?: boolean;
  className?: string;
  /** `vertical` stacks the arrow above the count as a fixed-width block. */
  orientation?: "horizontal" | "vertical";
  onChange?: (v: { upvotes: number; hasVoted: boolean }) => void;
}

export function UpvoteButton({
  postId,
  upvotes: initialUpvotes,
  hasVoted: initialHasVoted,
  className,
  orientation = "horizontal",
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
        // Raised chip everywhere; voted switches to the primary button surface.
        raisedSurfaceClass,
        "group/vote inline-flex cursor-pointer items-center text-xs text-muted-foreground transition-[color,filter] hover:text-primary hover:brightness-[0.98] dark:hover:brightness-125",
        orientation === "vertical"
          ? "h-12 w-11 flex-col justify-center gap-0.5 rounded-lg px-0 text-[13px]"
          : "h-7 gap-1.5 rounded-lg px-2",
        className,
        hasVoted &&
          "border-primary/60 bg-primary from-[color-mix(in_oklab,var(--primary),black_4%)] to-[color-mix(in_oklab,var(--primary),black_16%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.18)] hover:text-white hover:brightness-110 dark:border-primary/60 dark:from-[color-mix(in_oklab,var(--primary),black_4%)] dark:to-[color-mix(in_oklab,var(--primary),black_16%)] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(0,0,0,0.18)] dark:hover:text-white dark:hover:brightness-110",
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

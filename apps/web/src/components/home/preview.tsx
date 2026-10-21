"use client";

import { useState, type ReactNode } from "react";
import { UpvoteIcon, CommentsIcon } from "@/components/global/icons";
import {
  modalCardInnerClass,
  modalCardShellClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

export const previewControl =
  "cursor-pointer rounded-md outline-none motion-safe:transition-colors motion-safe:duration-150 hover:bg-foreground/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

/** Local interactive demonstrations, independent of workspace data. */
export function Preview({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      data-preview
      className={cn(
        modalCardShellClass,
        "w-full min-w-0 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_4px_16px_-6px_rgba(0,0,0,0.16)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_16px_-6px_rgba(0,0,0,0.4)]",
      )}
    >
      <div
        aria-hidden
        className="px-2.5 py-1 text-[11px] font-medium leading-5 text-foreground/80"
      >
        {label}
      </div>
      <div className={cn(modalCardInnerClass, "min-w-0", className)}>
        {children}
      </div>
    </div>
  );
}

export function Engagement({
  votes,
  comments,
  title,
  initiallyVoted = false,
}: {
  votes: number;
  comments?: number;
  title: string;
  initiallyVoted?: boolean;
}) {
  const [voted, setVoted] = useState(initiallyVoted);
  // The supplied total already includes the initial user's vote.
  const count = votes + Number(voted) - Number(initiallyVoted);
  return (
    <span className="inline-flex shrink-0 items-center gap-2 text-[11px] tabular-nums text-accent">
      <button
        type="button"
        aria-label={`${voted ? "Remove upvote from" : "Upvote"} ${title}`}
        title={voted ? "Remove upvote" : "Upvote"}
        aria-pressed={voted}
        onClick={() => setVoted((value) => !value)}
        className={cn(
          previewControl,
          "group/vote inline-flex items-center gap-1.5 px-1.5 py-1 text-muted-foreground/70 hover:text-orange-500/80 motion-safe:transition-[color,background-color,transform] motion-safe:active:scale-95",
          voted &&
            "bg-orange-500/10 text-orange-500 hover:bg-orange-500/15 hover:text-orange-500",
        )}
      >
        <UpvoteIcon
          aria-hidden
          className="size-3.5 motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover/vote:scale-110"
          fill={voted ? "currentColor" : "none"}
        />
        <span aria-live="polite" aria-atomic="true">
          {count}
        </span>
      </button>
      {comments !== undefined && (
        <span
          className="inline-flex items-center gap-1"
          aria-label={`${comments} comments`}
        >
          <CommentsIcon aria-hidden className="size-3.5" />
          {comments}
        </span>
      )}
    </span>
  );
}

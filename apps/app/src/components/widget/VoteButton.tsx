"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { cn } from "@featul/ui/lib/utils";
import { VoteIcon } from "@/components/upvote/VoteIcon";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type { IdentifiedUser, WidgetApiBase } from "./types";
import { viewerPayload } from "./utils";

type Props = {
  postId: string;
  upvotes: number;
  hasVoted?: boolean;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  className?: string;
  variant?: "boxed" | "plain";
  onChange?: (next: { upvotes: number; hasVoted: boolean }) => void;
};

export function WidgetVoteButton({
  postId,
  upvotes: initialUpvotes,
  hasVoted: initialHasVoted = false,
  apiBase,
  userId,
  identity,
  className,
  variant = "boxed",
  onChange,
}: Props) {
  const [upvotes, setUpvotes] = React.useState(initialUpvotes);
  const [hasVoted, setHasVoted] = React.useState(initialHasVoted);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setUpvotes(initialUpvotes);
    setHasVoted(initialHasVoted);
  }, [initialUpvotes, initialHasVoted, postId]);

  const handleVote = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    setPending(true);

    const previous = { upvotes, hasVoted };
    const optimistic = {
      upvotes: hasVoted ? Math.max(0, upvotes - 1) : upvotes + 1,
      hasVoted: !hasVoted,
    };
    setUpvotes(optimistic.upvotes);
    setHasVoted(optimistic.hasVoted);
    onChange?.(optimistic);

    try {
      const fingerprint = userId || identity?.email ? undefined : await getBrowserFingerprint();
      const res = await client.widget.vote.$post({
        ...viewerPayload(apiBase, { userId, identity, fingerprint }),
        postId,
      });
      if (!res.ok) throw new Error("vote failed");
      const data = await res.json();
      const next = {
        upvotes: Number(data.upvotes || 0),
        hasVoted: Boolean(data.hasVoted),
      };
      setUpvotes(next.upvotes);
      setHasVoted(next.hasVoted);
      onChange?.(next);
    } catch {
      setUpvotes(previous.upvotes);
      setHasVoted(previous.hasVoted);
      onChange?.(previous);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={pending}
      className={cn(
        "group/vote relative z-10 inline-flex cursor-pointer items-center gap-1.5 text-xs transition-colors disabled:cursor-not-allowed",
        variant === "boxed" &&
          "rounded-md border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.03)] px-2 py-1",
        hasVoted ? "text-red-500" : "text-[rgb(var(--widget-fg)/0.55)] hover:text-red-400",
        hasVoted && variant === "boxed" && "border-red-500/30",
        className,
      )}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? "Remove upvote" : "Upvote"}
    >
      <VoteIcon hasVoted={hasVoted} />
      <span className="tabular-nums font-medium">{upvotes}</span>
    </button>
  );
}

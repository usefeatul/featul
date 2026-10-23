"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import type { EmojiReaction } from "@featul/api/shared/reactions";
import { Button } from "@featul/ui/components/button";
import { toast } from "sonner";
import { LikeIcon } from "@/components/global/icons";
import {
  getCommentsQueryKey,
  type CommentListResponse,
  type CommentSurface,
} from "@/lib/comment/shared";

export default function Reactions({
  commentId,
  postId,
  surface,
  reactions = [],
}: {
  commentId: string;
  postId: string;
  surface: CommentSurface;
  reactions?: EmojiReaction[];
}) {
  const [optimistic, setOptimistic] = useState<EmojiReaction[] | null>(null);
  const busy = useRef(false);
  const queryClient = useQueryClient();
  const displayed = optimistic ?? reactions;
  const pending = optimistic !== null;

  const reaction = displayed.find((item) => item.emoji === "👍");
  const count = reaction?.count ?? 0;
  const reacted = reaction?.reacted ?? false;

  async function toggle() {
    const emoji = "👍";
    if (busy.current) return;
    busy.current = true;
    const current = reactions.find((reaction) => reaction.emoji === emoji);
    const active = !current?.reacted;
    const next = reactions.filter((reaction) => reaction.emoji !== emoji);
    const count = (current?.count ?? 0) + (active ? 1 : -1);
    if (count > 0) next.push({ emoji, count, reacted: active });
    next.sort((a, b) => a.emoji.localeCompare(b.emoji));
    setOptimistic(next);
    const queryKey = getCommentsQueryKey(postId, surface);
    try {
      await queryClient.cancelQueries({ queryKey });
      const response = await client.comment.react.$post({
        commentId,
        emoji,
        active,
      });
      if (!response.ok) {
        const error = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(
          error?.message || "Couldn't save your reaction. Try again.",
        );
      }
      const result = await response.json();
      queryClient.setQueryData<CommentListResponse>(queryKey, (previous) =>
        previous
          ? {
              ...previous,
              comments: previous.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, reactions: result.reactions }
                  : comment,
              ),
            }
          : previous,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't save your reaction. Try again.",
      );
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setOptimistic(null);
      busy.current = false;
    }
  }

  return (
    <Button
      type="button"
      variant={reacted ? "default" : "outline"}
      size="xs"
      disabled={pending}
      aria-pressed={reacted}
      aria-label={`${reacted ? "Remove thumbs-up" : "Give thumbs-up"}, ${count} ${count === 1 ? "reaction" : "reactions"}`}
      title={reacted ? "Remove thumbs-up" : "Give thumbs-up"}
      onClick={() => void toggle()}
      className="h-8 min-w-8 gap-1.5 px-2 text-xs tabular-nums"
    >
      <LikeIcon className="size-3.5" aria-hidden="true" />
      {count > 0 && <span aria-hidden="true">{count}</span>}
    </Button>
  );
}

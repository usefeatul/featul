"use client";

import StatusIcon from "@/components/requests/StatusIcon";
import { CommentsIcon } from "@featul/ui/icons/comments";
import { statusLabel } from "@/lib/roadmap";
import type { IdentifiedUser, WidgetApiBase, WidgetPost } from "./types";
import { formatRelativeDate, toPlain } from "./utils";
import { WidgetVoteButton } from "./VoteButton";
import { WidgetAuthorAvatar } from "./AuthorAvatar";

type Props = {
  post: WidgetPost;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onOpen: (post: WidgetPost) => void;
  onVoteChange?: (postId: string, upvotes: number, hasVoted: boolean) => void;
};

export function WidgetPostRow({
  post,
  apiBase,
  userId,
  identity,
  onOpen,
  onVoteChange,
}: Props) {
  const excerpt = toPlain(post.content);
  const author = post.isAnonymous ? "Guest" : post.authorName || "Guest";

  return (
    <article className="relative border-b border-white/10 px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => onOpen(post)}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-label={post.title}
      />

      <div className="relative z-[1] pointer-events-none">
        <div className="inline-flex items-center gap-1.5 text-xs text-white/50">
          <StatusIcon status={post.roadmapStatus || undefined} className="size-4 shrink-0" />
          <span>{statusLabel(String(post.roadmapStatus || "pending"))}</span>
          {post.boardName ? (
            <>
              <span aria-hidden className="text-white/20">
                ·
              </span>
              <span className="truncate">{post.boardName}</span>
            </>
          ) : null}
        </div>

        <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-white">
          {post.title}
        </h3>

        {excerpt ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/45">{excerpt}</p>
        ) : null}

        <div className="mt-3.5 flex items-end justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <WidgetAuthorAvatar name={author} image={post.authorImage} className="size-7" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white/80">{author}</p>
              {post.createdAt ? (
                <p className="text-[11px] text-white/35">{formatRelativeDate(post.createdAt)}</p>
              ) : null}
            </div>
          </div>

          <div className="pointer-events-auto flex shrink-0 items-center gap-3 text-xs text-white/45">
            <WidgetVoteButton
              postId={post.id}
              upvotes={post.upvotes || 0}
              hasVoted={post.hasVoted}
              apiBase={apiBase}
              userId={userId}
              identity={identity}
              variant="plain"
              onChange={({ upvotes, hasVoted }) => onVoteChange?.(post.id, upvotes, hasVoted)}
            />
            <span className="inline-flex items-center gap-1">
              <CommentsIcon aria-hidden className="size-3.5" />
              <span className="tabular-nums">{post.commentCount || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

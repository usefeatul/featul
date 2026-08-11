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
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="w-full cursor-pointer border-b border-white/10 px-5 py-3.5 text-left transition-colors last:border-b-0 hover:bg-white/[0.04]"
    >
      <div className="flex items-start gap-3">
        <WidgetVoteButton
          postId={post.id}
          upvotes={post.upvotes || 0}
          hasVoted={post.hasVoted}
          apiBase={apiBase}
          userId={userId}
          identity={identity}
          onChange={({ upvotes, hasVoted }) => onVoteChange?.(post.id, upvotes, hasVoted)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-white/45">
            <StatusIcon status={post.roadmapStatus || undefined} className="size-3.5 shrink-0" />
            <span className="truncate">
              {statusLabel(String(post.roadmapStatus || "pending"))}
              {post.boardName ? ` · ${post.boardName}` : ""}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-white">
            {post.title}
          </p>
          {excerpt ? (
            <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-white/45">{excerpt}</p>
          ) : null}
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-white/40">
            <WidgetAuthorAvatar name={author} image={post.authorImage} className="size-5" />
            <span className="max-w-[7rem] truncate">{author}</span>
            {post.createdAt ? (
              <>
                <span aria-hidden className="text-white/20">
                  ·
                </span>
                <span>{formatRelativeDate(post.createdAt)}</span>
              </>
            ) : null}
            <span aria-hidden className="text-white/20">
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <CommentsIcon className="size-3" />
              {post.commentCount || 0}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

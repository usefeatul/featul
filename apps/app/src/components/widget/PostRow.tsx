"use client";

import * as React from "react";
import StatusIcon from "@/components/requests/StatusIcon";
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
  const meta = [
    author,
    post.createdAt ? formatRelativeDate(post.createdAt) : null,
  ].filter(Boolean);

  return (
    <article className="relative border-b border-[rgb(var(--widget-fg)/0.1)] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-[rgb(var(--widget-fg)/0.03)]">
      <button
        type="button"
        onClick={() => onOpen(post)}
        className="absolute inset-0 z-0 cursor-pointer"
        aria-label={post.title}
      />

      <div className="relative z-[1] flex items-start gap-3 pointer-events-none">
        <WidgetAuthorAvatar name={author} image={post.authorImage} className="mt-0.5 size-9 shrink-0" />

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
            {post.title}
          </h3>

          {excerpt ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">{excerpt}</p>
          ) : null}

          {post.image ? (
            <div className="mt-2 overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.04)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image} alt="" className="h-24 w-full object-cover" />
            </div>
          ) : null}

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-[rgb(var(--widget-fg)/0.4)]">
            {meta.map((part, index) => (
              <React.Fragment key={`${part}-${index}`}>
                {index > 0 ? <span aria-hidden className="text-[rgb(var(--widget-fg)/0.2)]">·</span> : null}
                <span className="truncate">{part}</span>
              </React.Fragment>
            ))}
            <span aria-hidden className="text-[rgb(var(--widget-fg)/0.2)]">
              ·
            </span>
            <span className="inline-flex items-center gap-1 truncate">
              <StatusIcon status={post.roadmapStatus || undefined} className="size-3.5 shrink-0" />
              {statusLabel(String(post.roadmapStatus || "pending"))}
            </span>
          </div>
        </div>

        <div className="pointer-events-auto shrink-0 pt-0.5">
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
        </div>
      </div>
    </article>
  );
}

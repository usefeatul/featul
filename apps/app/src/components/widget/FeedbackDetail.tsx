"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { ExternalLink } from "lucide-react";
import StatusIcon from "@/components/requests/StatusIcon";
import { CommentsIcon } from "@featul/ui/icons/comments";
import { statusLabel } from "@/lib/roadmap";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type { IdentifiedUser, WidgetApiBase, WidgetPost } from "./types";
import {
  formatRelativeDate,
  publicBoardPostUrl,
  toPlain,
  viewerPayload,
} from "./utils";
import { WidgetVoteButton } from "./VoteButton";
import { WidgetAuthorAvatar } from "./AuthorAvatar";

type Props = {
  apiBase: WidgetApiBase;
  workspaceSlug: string;
  accent?: string;
  postId: string;
  initialPost?: WidgetPost | null;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (postId: string, upvotes: number, hasVoted: boolean) => void;
};

export function WidgetFeedbackDetail({
  apiBase,
  workspaceSlug,
  accent = "#3b82f6",
  postId,
  initialPost = null,
  userId,
  identity,
  onVoteChange,
}: Props) {
  const [post, setPost] = React.useState<WidgetPost | null>(initialPost);
  const [loading, setLoading] = React.useState(!initialPost);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const fingerprint =
          userId || identity?.email ? undefined : await getBrowserFingerprint();
        const res = await client.widget.post.$get({
          ...viewerPayload(apiBase, { userId, identity, fingerprint }),
          postId,
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!canceled) setPost(data.post as WidgetPost);
      } catch {
        if (!canceled) setError("Could not load this request.");
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => {
      canceled = true;
    };
  }, [apiBase, identity, postId, userId]);

  if (loading && !post) {
    return <p className="px-5 py-8 text-center text-sm text-white/45">Loading...</p>;
  }

  if (error && !post) {
    return (
      <p className="mx-5 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/85">
        {error}
      </p>
    );
  }

  if (!post) return null;

  const boardHref = publicBoardPostUrl(workspaceSlug, post.slug);
  const author = post.isAnonymous ? "Guest" : post.authorName || "Guest";
  const body = toPlain(post.content);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <StatusIcon status={post.roadmapStatus || undefined} className="size-3.5 shrink-0" />
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

        <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-white">
          {post.title}
        </h2>

        <div className="mt-4 flex items-center gap-2.5">
          <WidgetAuthorAvatar name={author} image={post.authorImage} className="size-7" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/85">{author}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
              {post.createdAt ? <span>{formatRelativeDate(post.createdAt)}</span> : null}
              <span aria-hidden className="text-white/20">
                ·
              </span>
              <span className="inline-flex items-center gap-1">
                <CommentsIcon className="size-3" />
                {post.commentCount || 0} comments
              </span>
            </p>
          </div>
        </div>

        <div className="my-5 h-px w-full bg-white/[0.06]" />

        {body ? (
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-white/70">{body}</p>
        ) : (
          <p className="text-sm text-white/40">No description provided.</p>
        )}

        {post.image ? (
          <div className="mt-5 overflow-hidden rounded-md bg-white/[0.04]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="max-h-64 w-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 px-5 py-3">
        <WidgetVoteButton
          postId={post.id}
          upvotes={post.upvotes || 0}
          hasVoted={post.hasVoted}
          apiBase={apiBase}
          userId={userId}
          identity={identity}
          className="h-10 px-3"
          onChange={({ upvotes, hasVoted }) => {
            setPost((prev) => (prev ? { ...prev, upvotes, hasVoted } : prev));
            onVoteChange?.(post.id, upvotes, hasVoted);
          }}
        />
        <a
          href={boardHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          Open on board
          <ExternalLink className="size-3.5 shrink-0" />
        </a>
      </div>
    </div>
  );
}

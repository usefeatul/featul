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
  postId: string;
  initialPost?: WidgetPost | null;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onVoteChange?: (postId: string, upvotes: number, hasVoted: boolean) => void;
};

export function WidgetFeedbackDetail({
  apiBase,
  workspaceSlug,
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
    return <p className="py-8 text-center text-sm text-white/45">Loading...</p>;
  }

  if (error && !post) {
    return (
      <p className="rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/85">
        {error}
      </p>
    );
  }

  if (!post) return null;

  const boardHref = publicBoardPostUrl(workspaceSlug, post.slug);
  const author = post.isAnonymous ? "Guest" : post.authorName || "Guest";
  const body = toPlain(post.content);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <WidgetVoteButton
          postId={post.id}
          upvotes={post.upvotes || 0}
          hasVoted={post.hasVoted}
          apiBase={apiBase}
          userId={userId}
          identity={identity}
          onChange={({ upvotes, hasVoted }) => {
            setPost((prev) => (prev ? { ...prev, upvotes, hasVoted } : prev));
            onVoteChange?.(post.id, upvotes, hasVoted);
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-white/45">
            <StatusIcon status={post.roadmapStatus || undefined} className="size-3.5" />
            <span>{statusLabel(String(post.roadmapStatus || "pending"))}</span>
            {post.boardName ? (
              <>
                <span aria-hidden>·</span>
                <span className="truncate">{post.boardName}</span>
              </>
            ) : null}
          </div>
          <h2 className="mt-2 text-lg font-semibold leading-snug text-white">{post.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-white/40">
            <WidgetAuthorAvatar name={author} image={post.authorImage} className="size-5" />
            <span>{author}</span>
            {post.createdAt ? <span>{formatRelativeDate(post.createdAt)}</span> : null}
            <span className="inline-flex items-center gap-1">
              <CommentsIcon className="size-3" />
              {post.commentCount || 0}
            </span>
          </div>
        </div>
      </div>

      {body ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{body}</p>
      ) : null}

      <a
        href={boardHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-white/10 bg-[#202020] px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-[#242424] hover:text-white"
      >
        View on board
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}

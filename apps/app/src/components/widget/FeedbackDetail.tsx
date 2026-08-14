"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { LoaderIcon } from "@featul/ui/icons/loader";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { VoteIcon } from "@/components/upvote/VoteIcon";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type { IdentifiedUser, WidgetApiBase, WidgetComment, WidgetPost } from "./types";
import { formatRelativeDate, toPlain, viewerPayload } from "./utils";
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

type CommentNode = WidgetComment & { replies: CommentNode[] };

function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildCommentTree(comments: WidgetComment[]): CommentNode[] {
  const byId = new Map<string, CommentNode>();
  for (const item of comments) {
    byId.set(item.id, { ...item, replies: [] });
  }
  const roots: CommentNode[] = [];
  for (const item of comments) {
    const node = byId.get(item.id)!;
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function WidgetFeedbackDetail({
  apiBase,
  accent = "#3b82f6",
  postId,
  initialPost = null,
  userId,
  identity,
  onVoteChange,
}: Props) {
  const [post, setPost] = React.useState<WidgetPost | null>(initialPost);
  const [comments, setComments] = React.useState<WidgetComment[]>([]);
  const [allowComments, setAllowComments] = React.useState(true);
  const [loading, setLoading] = React.useState(!initialPost);
  const [commentsLoading, setCommentsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<WidgetComment | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [composeError, setComposeError] = React.useState("");

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

  React.useEffect(() => {
    let canceled = false;
    async function loadComments() {
      setCommentsLoading(true);
      try {
        const fingerprint =
          userId || identity?.email ? undefined : await getBrowserFingerprint();
        const res = await client.widget.comments.$get({
          ...viewerPayload(apiBase, { userId, identity, fingerprint }),
          postId,
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (canceled) return;
        setAllowComments(Boolean(data.allowComments ?? true));
        setComments(Array.isArray(data.comments) ? (data.comments as WidgetComment[]) : []);
      } catch {
        if (!canceled) setComments([]);
      } finally {
        if (!canceled) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => {
      canceled = true;
    };
  }, [apiBase, identity, postId, userId]);

  const tree = React.useMemo(() => buildCommentTree(comments), [comments]);

  const submitComment = async () => {
    const content = draft.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setComposeError("");
    try {
      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      const res = await client.widget.createComment.$post({
        ...viewerPayload(apiBase, { userId, identity, fingerprint }),
        postId,
        content,
        parentId: replyTo?.id,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Could not post comment");
      }
      const data = await res.json();
      const created = data.comment as WidgetComment;
      setComments((prev) => [...prev, created]);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              commentCount:
                typeof data.commentCount === "number"
                  ? data.commentCount
                  : (prev.commentCount || 0) + 1,
            }
          : prev,
      );
      setDraft("");
      setReplyTo(null);
    } catch (err) {
      setComposeError(err instanceof Error ? err.message : "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !post) {
    return (
      <div
        className="flex min-h-0 flex-1 items-center justify-center"
        aria-label="Loading"
      >
        <LoaderIcon className="size-5 animate-spin text-[rgb(var(--widget-fg)/0.45)]" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <p className="mx-5 rounded-md border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.08)] px-3 py-2 text-sm text-[rgb(var(--widget-fg)/0.85)]">
        {error}
      </p>
    );
  }

  if (!post) return null;

  const author = post.isAnonymous ? "Guest" : post.authorName || "Guest";
  const body = toPlain(post.content);
  const canSubmit = draft.trim().length > 0 && !submitting && allowComments;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" data-widget-scroll="">
      <div className="px-5 pb-5 pt-1">
        <div className="flex items-center gap-2.5">
          <WidgetAuthorAvatar name={author} image={post.authorImage} className="size-8" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[rgb(var(--widget-fg))]">{author}</p>
            {post.createdAt ? (
              <p className="mt-0.5 text-[11px] text-[rgb(var(--widget-fg)/0.4)]">
                {formatShortDate(post.createdAt)}
              </p>
            ) : null}
          </div>
        </div>

        <h2 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-[rgb(var(--widget-fg))]">
          {post.title}
        </h2>

        {body ? (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-[rgb(var(--widget-fg)/0.7)]">
            {body}
          </p>
        ) : (
          <p className="mt-3 text-sm text-[rgb(var(--widget-fg)/0.4)]">No description provided.</p>
        )}

        {post.image ? (
          <div className="mt-5 overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.04)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image} alt="" className="max-h-64 w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-[rgb(var(--widget-fg)/0.55)]">
            <StatusIcon status={post.roadmapStatus || undefined} className="size-3.5 shrink-0" />
            <span>{statusLabel(String(post.roadmapStatus || "pending"))}</span>
          </div>
          <WidgetVoteButton
            postId={post.id}
            upvotes={post.upvotes || 0}
            hasVoted={post.hasVoted}
            apiBase={apiBase}
            userId={userId}
            identity={identity}
            className="h-8 rounded-md border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.03)] px-2.5"
            onChange={({ upvotes, hasVoted }) => {
              setPost((prev) => (prev ? { ...prev, upvotes, hasVoted } : prev));
              onVoteChange?.(post.id, upvotes, hasVoted);
            }}
          />
        </div>
      </div>

      <div className="border-t border-dashed border-[rgb(var(--widget-fg)/0.14)]" />

      <div className="px-5 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
          Comments · {post.commentCount || comments.length || 0}
        </p>

        {allowComments ? (
          <div className="mt-3 rounded-md border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.03)] p-3">
            {replyTo ? (
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-[rgb(var(--widget-fg)/0.5)]">
                <span className="truncate">
                  Replying to {replyTo.authorName || "comment"}
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="shrink-0 text-[rgb(var(--widget-fg)/0.55)] hover:text-[rgb(var(--widget-fg))]"
                >
                  Cancel
                </button>
              </div>
            ) : null}
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="min-h-[4.5rem] w-full resize-none bg-transparent text-sm text-[rgb(var(--widget-fg))] outline-none placeholder:text-[rgb(var(--widget-fg)/0.35)]"
            />
            <div className="mt-2 flex items-center justify-end">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => void submitComment()}
                className="inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: canSubmit ? accent : undefined }}
              >
                {submitting ? (
                  <LoaderIcon className="size-3.5 animate-spin" />
                ) : replyTo ? (
                  "Reply"
                ) : (
                  "Comment"
                )}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[rgb(var(--widget-fg)/0.45)]">
            Comments are disabled on this board.
          </p>
        )}

        {composeError ? (
          <p className="mt-3 text-sm text-red-400">{composeError}</p>
        ) : null}

        <div className="mt-5 space-y-0">
          {commentsLoading ? (
            <div className="flex justify-center py-6" aria-label="Loading comments">
              <LoaderIcon className="size-4 animate-spin text-[rgb(var(--widget-fg)/0.45)]" />
            </div>
          ) : tree.length ? (
            tree.map((node) => (
            <CommentThreadItem
              key={node.id}
              node={node}
              apiBase={apiBase}
              userId={userId}
              identity={identity}
              allowComments={allowComments}
              onReply={(item) => {
                setReplyTo(item);
                setDraft("");
              }}
              onVoteChange={(id, upvotes, hasVoted) => {
                setComments((prev) =>
                  prev.map((row) => (row.id === id ? { ...row, upvotes, hasVoted } : row)),
                );
              }}
            />
          ))
          ) : (
            <p className="py-4 text-sm text-[rgb(var(--widget-fg)/0.45)]">
              No comments yet. Start the conversation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentThreadItem({
  node,
  apiBase,
  userId,
  identity,
  allowComments,
  onReply,
  onVoteChange,
  isReply = false,
}: {
  node: CommentNode;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  allowComments: boolean;
  onReply: (comment: WidgetComment) => void;
  onVoteChange: (id: string, upvotes: number, hasVoted: boolean) => void;
  isReply?: boolean;
}) {
  const canReply = allowComments && node.depth < 2;

  return (
    <div className={isReply ? "relative ml-4 border-l border-[rgb(var(--widget-fg)/0.12)] pl-4" : ""}>
      <div className="py-4">
        <div className="flex items-start gap-2.5">
          <WidgetAuthorAvatar
            name={node.authorName}
            image={node.authorImage}
            className="size-7 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-baseline gap-2">
              <p className="truncate text-sm font-medium text-[rgb(var(--widget-fg))]">
                {node.authorName}
              </p>
              <p className="shrink-0 text-[11px] text-[rgb(var(--widget-fg)/0.4)]">
                {formatShortDate(node.createdAt) || formatRelativeDate(node.createdAt)}
              </p>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.75)]">
              {node.content}
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-3">
              {canReply ? (
                <button
                  type="button"
                  onClick={() => onReply(node)}
                  className="text-xs font-medium text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:text-[rgb(var(--widget-fg)/0.75)]"
                >
                  Reply
                </button>
              ) : (
                <span />
              )}
              <CommentVoteButton
                commentId={node.id}
                upvotes={node.upvotes}
                hasVoted={node.hasVoted}
                apiBase={apiBase}
                userId={userId}
                identity={identity}
                onChange={({ upvotes, hasVoted }) => onVoteChange(node.id, upvotes, hasVoted)}
              />
            </div>
          </div>
        </div>
      </div>

      {node.replies.length ? (
        <div>
          {node.replies.map((reply) => (
            <CommentThreadItem
              key={reply.id}
              node={reply}
              apiBase={apiBase}
              userId={userId}
              identity={identity}
              allowComments={allowComments}
              onReply={onReply}
              onVoteChange={onVoteChange}
              isReply
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CommentVoteButton({
  commentId,
  upvotes: initialUpvotes,
  hasVoted: initialHasVoted = false,
  apiBase,
  userId,
  identity,
  onChange,
}: {
  commentId: string;
  upvotes: number;
  hasVoted?: boolean;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onChange?: (next: { upvotes: number; hasVoted: boolean }) => void;
}) {
  const [upvotes, setUpvotes] = React.useState(initialUpvotes);
  const [hasVoted, setHasVoted] = React.useState(initialHasVoted);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setUpvotes(initialUpvotes);
    setHasVoted(initialHasVoted);
  }, [commentId, initialHasVoted, initialUpvotes]);

  const handleVote = async () => {
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
      const res = await client.widget.voteComment.$post({
        ...viewerPayload(apiBase, { userId, identity, fingerprint }),
        commentId,
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
      onClick={() => void handleVote()}
      disabled={pending}
      className={`inline-flex items-center gap-1 text-xs tabular-nums transition-colors disabled:cursor-not-allowed ${
        hasVoted
          ? "text-red-500"
          : "text-[rgb(var(--widget-fg)/0.45)] hover:text-red-400"
      }`}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? "Remove upvote" : "Upvote"}
    >
      <VoteIcon hasVoted={hasVoted} />
      <span className="font-medium">{upvotes}</span>
    </button>
  );
}

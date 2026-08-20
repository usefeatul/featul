"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { ImageIcon } from "@featul/ui/icons/image";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { X } from "lucide-react";
import { VoteIcon } from "@/components/upvote/VoteIcon";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type { IdentifiedUser, WidgetApiBase, WidgetComment } from "./types";
import { formatRelativeDate, viewerPayload } from "./utils";
import { WidgetAuthorAvatar } from "./avatar";
import { WidgetImage } from "./image";
import { WidgetCommentThreadSkeleton } from "./skeleton";
import {
  widgetToolbarInnerClass,
  widgetToolbarItemClass,
  widgetToolbarShellClass,
} from "./chrome";

type CommentNode = WidgetComment & { replies: CommentNode[] };

export type UploadedImage = { url: string; name: string };

export type ComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  uploadedImage: UploadedImage | null;
  onRemoveImage: () => void;
  onPickImage: () => void;
  uploading: boolean;
  canUpload: boolean;
  canSubmit: boolean;
  submitting: boolean;
  accent: string;
  error?: string;
  onSubmit: () => void;
};

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

export function Comments({
  comments,
  commentsLoading,
  allowComments,
  commentCount,
  composeError,
  replyTo,
  composerProps,
  apiBase,
  userId,
  identity,
  onToggleReply,
  onVoteChange,
}: {
  comments: WidgetComment[];
  commentsLoading: boolean;
  allowComments: boolean;
  commentCount: number;
  composeError: string;
  replyTo: WidgetComment | null;
  composerProps: ComposerProps;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  onToggleReply: (comment: WidgetComment) => void;
  onVoteChange: (id: string, upvotes: number, hasVoted: boolean) => void;
}) {
  const tree = React.useMemo(() => buildCommentTree(comments), [comments]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
        Comments · {commentCount}
      </p>

      {allowComments && !replyTo ? (
        <div className="mt-3">
          <CommentComposer
            {...composerProps}
            error={composeError}
            placeholder="Add a comment..."
            submitLabel="Comment"
          />
        </div>
      ) : null}

      {!allowComments ? (
        <p className="mt-3 text-sm text-[rgb(var(--widget-fg)/0.45)]">
          Comments are disabled on this board.
        </p>
      ) : null}

      <div className="mt-2 flex min-h-0 flex-1 flex-col">
        {commentsLoading ? (
          <WidgetCommentThreadSkeleton rows={3} />
        ) : tree.length ? (
          tree.map((node, index) => (
            <div key={node.id}>
              {index > 0 ? (
                <div className="-mx-5 border-t border-dashed border-[rgb(var(--widget-fg)/0.12)]" />
              ) : null}
              <CommentThreadItem
                node={node}
                apiBase={apiBase}
                userId={userId}
                identity={identity}
                allowComments={allowComments}
                replyToId={replyTo?.id ?? null}
                onToggleReply={onToggleReply}
                onVoteChange={onVoteChange}
                replyComposer={
                  replyTo ? (
                    <CommentComposer
                      {...composerProps}
                      error={composeError}
                      placeholder={`Reply to ${replyTo.authorName || "comment"}...`}
                      submitLabel="Reply"
                      autoFocus
                    />
                  ) : null
                }
              />
            </div>
          ))
        ) : (
          <p className="flex flex-1 items-center justify-center px-4 py-8 text-center text-sm text-[rgb(var(--widget-fg)/0.45)]">
            No comments yet. Start the conversation.
          </p>
        )}
      </div>
    </div>
  );
}

function CommentComposer({
  draft,
  onDraftChange,
  uploadedImage,
  onRemoveImage,
  onPickImage,
  uploading,
  canUpload,
  canSubmit,
  submitting,
  accent,
  error,
  onSubmit,
  placeholder,
  submitLabel,
  autoFocus = false,
}: ComposerProps & {
  placeholder: string;
  submitLabel: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[rgb(var(--widget-fg)/0.12)] bg-[rgb(var(--widget-fg)/0.03)] p-3">
      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        className="min-h-[4.5rem] w-full resize-none bg-transparent text-sm text-[rgb(var(--widget-fg))] outline-none placeholder:text-[rgb(var(--widget-fg)/0.35)]"
      />
      {uploadedImage ? (
        <div className="relative mt-2 w-fit shrink-0">
          <WidgetImage
            url={uploadedImage.url}
            alt={uploadedImage.name}
            className="h-16 w-24"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute -top-1.5 -right-1.5 z-20 flex size-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md ring-1 ring-[rgb(var(--widget-surface))] hover:bg-destructive/90"
            aria-label="Remove image"
          >
            <X className="size-2.5" />
          </button>
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className={widgetToolbarShellClass}>
          <div className={widgetToolbarInnerClass}>
            <button
              type="button"
              onClick={onPickImage}
              disabled={uploading || Boolean(uploadedImage) || !canUpload}
              className={`${widgetToolbarItemClass} flex size-8 cursor-pointer items-center justify-center text-[rgb(var(--widget-fg)/0.45)] hover:text-[rgb(var(--widget-fg))] disabled:cursor-not-allowed disabled:opacity-40`}
              aria-label="Add image"
            >
              {uploading ? (
                <LoaderIcon className="size-3.5 animate-spin" />
              ) : (
                <ImageIcon className="size-3.5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {error ? (
            <p className="truncate text-xs text-[rgb(var(--widget-fg)/0.5)]">{error}</p>
          ) : null}
          <button
            type="button"
            disabled={!canSubmit}
            onClick={onSubmit}
            className="inline-flex h-8 shrink-0 cursor-pointer items-center rounded-md px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[rgb(var(--widget-fg)/0.12)] disabled:text-[rgb(var(--widget-fg)/0.35)] disabled:opacity-100"
            style={{ backgroundColor: canSubmit ? accent : undefined }}
          >
            {submitting ? <LoaderIcon className="size-3.5 animate-spin" /> : submitLabel}
          </button>
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
  replyToId,
  onToggleReply,
  onVoteChange,
  replyComposer,
}: {
  node: CommentNode;
  apiBase: WidgetApiBase;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  allowComments: boolean;
  replyToId: string | null;
  onToggleReply: (comment: WidgetComment) => void;
  onVoteChange: (id: string, upvotes: number, hasVoted: boolean) => void;
  replyComposer?: React.ReactNode;
}) {
  const canReply = allowComments && node.depth < 3;
  const isReplying = replyToId === node.id;
  const hasReplies = node.replies.length > 0;
  const dateLabel = formatShortDate(node.createdAt) || formatRelativeDate(node.createdAt);

  return (
    <div className="group/thread relative">
      <div className="relative flex gap-3 py-4">
        <div className="relative flex shrink-0 flex-col items-center">
          <WidgetAuthorAvatar
            name={node.authorName}
            image={node.authorImage}
            className="relative z-[1] size-7"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <p className="truncate text-sm font-medium text-[rgb(var(--widget-fg))]">
              {node.authorName}
            </p>
            {dateLabel ? (
              <>
                <span className="text-xs text-[rgb(var(--widget-fg)/0.3)]" aria-hidden>
                  ·
                </span>
                <p className="shrink-0 text-xs text-[rgb(var(--widget-fg)/0.4)]">{dateLabel}</p>
              </>
            ) : null}
          </div>

          {node.content ? (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.78)]">
              {node.content}
            </p>
          ) : null}

          {node.image ? (
            <div className="mt-2">
              <WidgetImage url={node.image} className="h-16 w-24" />
            </div>
          ) : null}

          <div className="mt-2.5 flex items-center justify-between gap-3">
            {canReply ? (
              <button
                type="button"
                onClick={() => onToggleReply(node)}
                className={`text-xs font-medium transition-colors ${
                  isReplying
                    ? "text-[rgb(var(--widget-fg)/0.7)]"
                    : "text-[rgb(var(--widget-fg)/0.4)] hover:text-[rgb(var(--widget-fg)/0.7)]"
                }`}
                aria-expanded={isReplying}
              >
                {isReplying ? "Cancel" : "Reply"}
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

          {isReplying && replyComposer ? <div className="mt-3">{replyComposer}</div> : null}
        </div>
      </div>

      {hasReplies ? (
        <>
          <div
            className="absolute bottom-0 left-[14px] top-10 w-px -translate-x-1/2 bg-[rgb(var(--widget-fg)/0.16)]"
            aria-hidden
          />
          <div className="relative pl-11">
            {node.replies.map((reply, index) => (
              <div key={reply.id} className="relative">
                <ReplyBranch isLast={index === node.replies.length - 1} />
                <CommentThreadItem
                  node={reply}
                  apiBase={apiBase}
                  userId={userId}
                  identity={identity}
                  allowComments={allowComments}
                  replyToId={replyToId}
                  onToggleReply={onToggleReply}
                  onVoteChange={onVoteChange}
                  replyComposer={replyComposer}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ReplyBranch({ isLast }: { isLast: boolean }) {
  return (
    <>
      {isLast ? (
        <div
          className="pointer-events-none absolute -left-8 top-4 bottom-0 z-[1] w-4 bg-[rgb(var(--widget-surface))]"
          aria-hidden
        />
      ) : null}
      <svg
        aria-hidden
        viewBox="0 0 36 14"
        fill="none"
        className="pointer-events-none absolute -left-[30.5px] top-4 z-[2] h-3.5 w-9 text-[rgb(var(--widget-fg)/0.16)]"
      >
        <path
          d="M0.5 0 A 13.5 13.5 0 0 0 14 13.5 H 35.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="butt"
        />
      </svg>
    </>
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
        hasVoted ? "text-red-500" : "text-[rgb(var(--widget-fg)/0.45)] hover:text-red-400"
      }`}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? "Remove upvote" : "Upvote"}
    >
      <VoteIcon hasVoted={hasVoted} />
      <span className="font-medium">{upvotes}</span>
    </button>
  );
}

"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { ImageIcon } from "@featul/ui/icons/image";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { X } from "lucide-react";
import {
  IMAGE_UPLOAD_CONTENT_TYPES,
  POST_IMAGE_UPLOAD_MAX_BYTES,
} from "@featul/api/upload-policy";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { VoteIcon } from "@/components/upvote/VoteIcon";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type { IdentifiedUser, WidgetApiBase, WidgetComment, WidgetPost } from "./types";
import { formatRelativeDate, toPlain, viewerPayload } from "./utils";
import { WidgetVoteButton } from "./VoteButton";
import { WidgetAuthorAvatar } from "./AuthorAvatar";
import { WidgetImage } from "./WidgetImage";

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

type UploadedImage = { url: string; name: string };

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
  const [uploading, setUploading] = React.useState(false);
  const [composeError, setComposeError] = React.useState("");
  const [uploadedImage, setUploadedImage] = React.useState<UploadedImage | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            (body as { message?: string } | null)?.message || "Failed to load comments",
          );
        }
        const data = await res.json();
        if (canceled) return;
        setAllowComments(Boolean(data.allowComments ?? true));
        setComments(Array.isArray(data.comments) ? (data.comments as WidgetComment[]) : []);
        setComposeError("");
      } catch (err) {
        if (!canceled) {
          setComments([]);
          setComposeError(err instanceof Error ? err.message : "Failed to load comments");
        }
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

  const clearCompose = () => {
    setDraft("");
    setUploadedImage(null);
    setComposeError("");
  };

  const cancelReply = () => {
    setReplyTo(null);
    clearCompose();
  };

  const startReply = (item: WidgetComment) => {
    if (replyTo?.id === item.id) {
      cancelReply();
      return;
    }
    setReplyTo(item);
    clearCompose();
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !post?.boardId) return;

    if (!(IMAGE_UPLOAD_CONTENT_TYPES as readonly string[]).includes(file.type)) {
      setComposeError("Unsupported file type. Use PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > POST_IMAGE_UPLOAD_MAX_BYTES) {
      setComposeError("Image too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    setComposeError("");
    try {
      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      const signed = await client.widget.uploadImage.$post({
        ...viewerPayload(apiBase, { userId, identity, fingerprint }),
        boardId: post.boardId,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });
      if (!signed.ok) {
        const error = (await signed.json().catch(() => null)) as { message?: string } | null;
        throw new Error(error?.message || "Failed to get upload URL");
      }
      const data = (await signed.json()) as {
        uploadUrl?: string;
        publicUrl?: string;
      };
      if (!data.uploadUrl || !data.publicUrl) throw new Error("Upload URL response was incomplete");

      const put = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Upload failed");

      setUploadedImage({ url: data.publicUrl, name: file.name });
    } catch (error) {
      setComposeError(error instanceof Error ? error.message : "Could not upload image.");
      setUploadedImage(null);
    } finally {
      setUploading(false);
    }
  };

  const submitComment = async () => {
    const content = draft.trim();
    if ((!content && !uploadedImage) || submitting || uploading) return;
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
        image: uploadedImage?.url,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          (body as { message?: string } | null)?.message || "Could not post comment",
        );
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
      clearCompose();
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
  const canSubmit =
    (draft.trim().length > 0 || Boolean(uploadedImage)) &&
    !submitting &&
    !uploading &&
    allowComments;

  const composerProps = {
    draft,
    onDraftChange: setDraft,
    uploadedImage,
    onRemoveImage: () => setUploadedImage(null),
    fileInputRef,
    onPickImage: () => fileInputRef.current?.click(),
    uploading,
    canUpload: Boolean(post.boardId),
    canSubmit,
    submitting,
    accent,
    onSubmit: () => void submitComment(),
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide" data-widget-scroll="">
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_UPLOAD_CONTENT_TYPES.join(",")}
        onChange={(event) => void uploadImage(event)}
        className="hidden"
        disabled={uploading || Boolean(uploadedImage) || !post.boardId}
      />

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
          <div className="mt-4">
            <WidgetImage url={post.image} alt={post.title} imgClassName="h-20 w-20 object-cover" />
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
            variant="plain"
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

        {allowComments && !replyTo ? (
          <div className="mt-3">
            <CommentComposer
              {...composerProps}
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

        {composeError ? (
          <p className="mt-3 text-sm text-red-400">{composeError}</p>
        ) : null}

        <div className="mt-2">
          {commentsLoading ? (
            <div className="flex justify-center py-6" aria-label="Loading comments">
              <LoaderIcon className="size-4 animate-spin text-[rgb(var(--widget-fg)/0.45)]" />
            </div>
          ) : tree.length ? (
            tree.map((node, index) => (
              <div key={node.id}>
                {index > 0 ? (
                  <div className="border-t border-dashed border-[rgb(var(--widget-fg)/0.12)]" />
                ) : null}
                <CommentThreadItem
                  node={node}
                  apiBase={apiBase}
                  userId={userId}
                  identity={identity}
                  allowComments={allowComments}
                  replyToId={replyTo?.id ?? null}
                  onToggleReply={startReply}
                  onVoteChange={(id, upvotes, hasVoted) => {
                    setComments((prev) =>
                      prev.map((row) => (row.id === id ? { ...row, upvotes, hasVoted } : row)),
                    );
                  }}
                  replyComposer={
                    replyTo ? (
                      <CommentComposer
                        {...composerProps}
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
            <p className="py-4 text-sm text-[rgb(var(--widget-fg)/0.45)]">
              No comments yet. Start the conversation.
            </p>
          )}
        </div>
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
  onSubmit,
  placeholder,
  submitLabel,
  autoFocus = false,
}: {
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
  onSubmit: () => void;
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
            imgClassName="h-14 w-14 object-cover"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute right-0.5 top-0.5 z-[1] flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white/85 transition-colors hover:bg-black/85 hover:text-white"
            aria-label="Remove image"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : null}
      <div className="mt-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPickImage}
          disabled={uploading || Boolean(uploadedImage) || !canUpload}
          className="flex size-8 cursor-pointer items-center justify-center rounded-md text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Add image"
        >
          {uploading ? (
            <LoaderIcon className="size-3.5 animate-spin" />
          ) : (
            <ImageIcon className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[rgb(var(--widget-fg)/0.12)] disabled:text-[rgb(var(--widget-fg)/0.35)] disabled:opacity-100"
          style={{ backgroundColor: canSubmit ? accent : undefined }}
        >
          {submitting ? <LoaderIcon className="size-3.5 animate-spin" /> : submitLabel}
        </button>
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
  const canReply = allowComments && node.depth < 2;
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
                <span className="text-[11px] text-[rgb(var(--widget-fg)/0.3)]" aria-hidden>
                  ·
                </span>
                <p className="shrink-0 text-[11px] text-[rgb(var(--widget-fg)/0.4)]">{dateLabel}</p>
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
              <WidgetImage url={node.image} imgClassName="h-16 w-16 object-cover" />
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
            className="absolute bottom-4 left-[13px] top-11 w-px bg-[rgb(var(--widget-fg)/0.12)]"
            aria-hidden
          />
          <div className="relative pl-10">
            {node.replies.map((reply) => (
              <CommentThreadItem
                key={reply.id}
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
            ))}
          </div>
        </>
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

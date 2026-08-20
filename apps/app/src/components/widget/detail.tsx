"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import {
  IMAGE_UPLOAD_CONTENT_TYPES,
  POST_IMAGE_UPLOAD_MAX_BYTES,
} from "@featul/api/upload/policy";
import StatusIcon from "@/components/requests/StatusIcon";
import { statusLabel } from "@/lib/roadmap";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import { Comments, type UploadedImage } from "./comments";
import { WidgetEmpty } from "./empty";
import { parseWidgetComment, parseWidgetComments, parseWidgetPost } from "./load";
import { WidgetDetailSkeleton } from "./skeleton";
import type { IdentifiedUser, WidgetApiBase, WidgetComment, WidgetPost } from "./types";
import { isAllowedImageType, toPlain, viewerPayload, readErrorMessage, readSignedUpload, deleteWidgetUploadedImage } from "./utils";
import { WidgetVoteButton } from "./vote";
import { WidgetAuthorAvatar } from "./avatar";
import { WidgetImageStrip } from "./gallery";

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

function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
        if (!canceled) setPost(parseWidgetPost(data.post));
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
          throw new Error(
            readErrorMessage(await res.json().catch(() => null), "Failed to load comments"),
          );
        }
        const data = await res.json();
        if (canceled) return;
        setAllowComments(Boolean(data.allowComments ?? true));
        setComments(parseWidgetComments(data.comments));
        setComposeError("");
      } catch {
        if (!canceled) {
          setComments([]);
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

  const discardUploadedImage = () => {
    const url = uploadedImage?.url;
    setUploadedImage(null);
    if (!url) return;
    void (async () => {
      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      await deleteWidgetUploadedImage({
        apiBase,
        url,
        userId,
        identity,
        fingerprint,
      });
    })();
  };

  const clearCompose = () => {
    setDraft("");
    setUploadedImage(null);
    setComposeError("");
  };

  const cancelReply = () => {
    setReplyTo(null);
    discardUploadedImage();
    setDraft("");
    setComposeError("");
  };

  const startReply = (item: WidgetComment) => {
    if (replyTo?.id === item.id) {
      cancelReply();
      return;
    }
    setReplyTo(item);
    discardUploadedImage();
    setDraft("");
    setComposeError("");
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !post?.boardId) return;

    if (!isAllowedImageType(file.type, IMAGE_UPLOAD_CONTENT_TYPES)) {
      setComposeError("Use a PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > POST_IMAGE_UPLOAD_MAX_BYTES) {
      setComposeError("Images need to be 5MB or smaller.");
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
        throw new Error(readErrorMessage(await signed.json().catch(() => null), "Failed to get upload URL"));
      }
      const data = readSignedUpload(await signed.json());
      if (!data) throw new Error("Upload URL response was incomplete");

      const put = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("Upload failed");

      setUploadedImage({ url: data.publicUrl, name: file.name });
    } catch {
      setComposeError("That image couldn’t be added.");
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
        throw new Error(
          readErrorMessage(await res.json().catch(() => null), "Could not post comment"),
        );
      }
      const data = await res.json();
      const created = parseWidgetComment(data.comment);
      if (!created) throw new Error("Could not post comment");
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
    } catch {
      setComposeError("Couldn’t post this. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !post) {
    return <WidgetDetailSkeleton />;
  }

  if (error && !post) {
    return (
      <WidgetEmpty
        title="Couldn’t load this request"
        description="It may have been removed, or the connection dropped."
      />
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
    onRemoveImage: discardUploadedImage,
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
              <p className="mt-0.5 text-xs text-[rgb(var(--widget-fg)/0.4)]">
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

        <WidgetImageStrip
          urls={post.images?.length ? post.images : post.image ? [post.image] : []}
          alt={post.title}
          className="mt-4"
        />

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

      <Comments
        comments={comments}
        commentsLoading={commentsLoading}
        allowComments={allowComments}
        commentCount={post.commentCount || comments.length || 0}
        composeError={composeError}
        replyTo={replyTo}
        composerProps={composerProps}
        apiBase={apiBase}
        userId={userId}
        identity={identity}
        onToggleReply={startReply}
        onVoteChange={(id, upvotes, hasVoted) => {
          setComments((prev) =>
            prev.map((row) => (row.id === id ? { ...row, upvotes, hasVoted } : row)),
          );
        }}
      />
    </div>
  );
}

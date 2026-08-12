"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Textarea } from "@featul/ui/components/textarea";
import { ImageIcon } from "@featul/ui/icons/image";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { X } from "lucide-react";
import {
  IMAGE_UPLOAD_CONTENT_TYPES,
  POST_IMAGE_UPLOAD_MAX_BYTES,
} from "@featul/api/upload-policy";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type {
  Board,
  IdentifiedUser,
  SimilarPost,
  WidgetApiBase,
  WidgetPost,
} from "./types";
import { viewerPayload, resolveBugsBoard } from "./utils";

type Props = {
  apiBase: WidgetApiBase;
  boards: Board[];
  userId?: string | null;
  identity?: IdentifiedUser | null;
  primaryColor?: string;
  onCancel: () => void;
  onCreated: (post: WidgetPost) => void;
};

type UploadedImage = {
  url: string;
  name: string;
};

export function WidgetFeedbackCompose({
  apiBase,
  boards,
  userId,
  identity,
  primaryColor = "#3b82f6",
  onCancel: _onCancel,
  onCreated,
}: Props) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [similar, setSimilar] = React.useState<SimilarPost[]>([]);
  const [uploadedImage, setUploadedImage] = React.useState<UploadedImage | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const selectedBoard = React.useMemo(() => resolveBugsBoard(boards), [boards]);
  const boardId = selectedBoard?.id || "";
  const canSubmit =
    Boolean(boardId) && title.trim().length >= 3 && !submitting && !uploading;

  React.useEffect(() => {
    const q = title.trim();
    if (q.length < 2) {
      setSimilar([]);
      return;
    }
    let canceled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await client.widget.similar.$get({
          ...apiBase,
          title: q.slice(0, 128),
          boardId: boardId || undefined,
        });
        if (!res.ok || canceled) return;
        const data = await res.json();
        if (!canceled) setSimilar(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        if (!canceled) setSimilar([]);
      }
    }, 300);
    return () => {
      canceled = true;
      window.clearTimeout(timer);
    };
  }, [apiBase, boardId, title]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!boardId) {
      setMessage("Select a board before uploading an image.");
      return;
    }
    if (!(IMAGE_UPLOAD_CONTENT_TYPES as readonly string[]).includes(file.type)) {
      setMessage("Unsupported file type. Use PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > POST_IMAGE_UPLOAD_MAX_BYTES) {
      setMessage("Image too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    setMessage("");
    try {
      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      const signed = await client.widget.uploadImage.$post({
        ...viewerPayload(apiBase, { userId, identity, fingerprint }),
        boardId,
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
      setMessage(error instanceof Error ? error.message : "Could not upload image.");
      setUploadedImage(null);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setMessage("");
    try {
      const fingerprint =
        userId || identity?.email ? undefined : await getBrowserFingerprint();
      const res = await client.widget.create.$post({
        ...viewerPayload(apiBase, { userId, identity, fingerprint }),
        boardId,
        title: title.trim().slice(0, 120),
        content: (content.trim() || title.trim()).slice(0, 5000),
        image: uploadedImage?.url,
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const created = data.post;
      onCreated({
        id: created.id,
        title: created.title,
        slug: created.slug,
        content: created.content,
        image: created.image ?? uploadedImage?.url ?? null,
        upvotes: created.upvotes ?? 1,
        commentCount: created.commentCount ?? 0,
        roadmapStatus: created.roadmapStatus ?? "pending",
        createdAt: created.createdAt ?? new Date().toISOString(),
        boardId,
        boardName: selectedBoard?.name || null,
        boardSlug: selectedBoard?.slug || null,
        isAnonymous: created.isAnonymous ?? !(userId || identity?.email),
        authorName: identity?.name || null,
        authorImage: identity?.avatar || null,
        hasVoted: true,
      });
      setTitle("");
      setContent("");
      setSimilar([]);
      setUploadedImage(null);
    } catch {
      setMessage(
        identity && !userId
          ? "Identification failed. Check the email passed to identify()."
          : "Could not submit feedback.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What's on your mind?"
        maxLength={120}
        autoFocus
        className="mb-1 w-full border-0 bg-transparent px-0 py-2 text-lg font-semibold text-[rgb(var(--widget-fg))] outline-none placeholder:text-[rgb(var(--widget-fg)/0.3)]"
      />

      <Textarea
        variant="plain"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Add more detail..."
        className="min-h-0 flex-1 resize-none px-0 py-2 text-[15px] leading-relaxed text-[rgb(var(--widget-fg)/0.85)] shadow-none placeholder:text-[rgb(var(--widget-fg)/0.25)] focus-visible:ring-0"
      />

      {uploadedImage ? (
        <div className="relative mt-2 overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.04)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedImage.url}
            alt={uploadedImage.name}
            className="max-h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => setUploadedImage(null)}
            className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-md bg-black/60 text-white/80 transition-colors hover:bg-black/75 hover:text-white"
            aria-label="Remove image"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      {similar.length ? (
        <div className="mt-2 rounded-md bg-[rgb(var(--widget-fg)/0.04)] p-3">
          <p className="text-xs font-semibold" style={{ color: primaryColor || "#3b82f6" }}>
            Similar requests
          </p>
          <ul className="mt-2 space-y-1.5">
            {similar.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-[rgb(var(--widget-fg)/0.7)]">{item.title}</span>
                <span className="shrink-0 text-[rgb(var(--widget-fg)/0.4)]">{item.upvotes || 0} votes</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 rounded-md bg-[rgb(var(--widget-fg)/0.05)] px-3 py-2 text-sm text-[rgb(var(--widget-fg)/0.85)]">{message}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-4">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_UPLOAD_CONTENT_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || Boolean(uploadedImage)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || Boolean(uploadedImage)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-md text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add image"
          >
            {uploading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </button>
        </div>
        <Button
          type="submit"
          variant="plain"
          disabled={!canSubmit}
          className="h-10 cursor-pointer rounded-md bg-[rgb(var(--widget-cta))] px-5 text-sm font-semibold text-[rgb(var(--widget-cta-fg))] hover:opacity-90 disabled:bg-[rgb(var(--widget-fg)/0.2)] disabled:text-[rgb(var(--widget-fg)/0.35)]"
        >
          {submitting ? <LoaderIcon className="size-4 animate-spin" /> : "Post"}
        </Button>
      </div>
    </form>
  );
}

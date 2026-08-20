"use client";

import * as React from "react";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Textarea } from "@featul/ui/components/textarea";
import { ImageIcon } from "@featul/ui/icons/image";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { Camera, Check, Heart } from "lucide-react";
import { ScreenshotAnnotator } from "./annotate";
import {
  IMAGE_UPLOAD_CONTENT_TYPES,
  POST_IMAGE_UPLOAD_MAX_BYTES,
  POST_MAX_IMAGES,
} from "@featul/api/upload/policy";
import { getBrowserFingerprint } from "@/utils/fingerprint";
import type {
  Board,
  IdentifiedUser,
  SimilarPost,
  WidgetApiBase,
  WidgetPost,
} from "./types";
import { parseSimilarPosts, parseWidgetPost } from "./load";
import { dataUrlToImageFile, isAllowedImageType, viewerPayload, resolveBugsBoard, readErrorMessage, readSignedUpload, deleteWidgetUploadedImage } from "./utils";
import { WidgetImageStrip } from "./gallery";
import {
  widgetToolbarInnerClass,
  widgetToolbarItemClass,
  widgetToolbarSeparatorClass,
  widgetToolbarShellClass,
} from "./chrome";

type Props = {
  apiBase: WidgetApiBase;
  boards: Board[];
  userId?: string | null;
  identity?: IdentifiedUser | null;
  accent: string;
  ink: string;
  screenshotUrl?: string | null;
  capturing?: boolean;
  captureHint?: string;
  onCapture: () => void;
  onScreenshotConsumed: () => void;
  onCancel: () => void;
  onCreated: (post: WidgetPost) => void;
  onView: (post: WidgetPost) => void;
};

type UploadedImage = {
  url: string;
  name: string;
  type: string;
};

export function WidgetFeedbackCompose({
  apiBase,
  boards,
  userId,
  identity,
  accent,
  ink,
  screenshotUrl = null,
  capturing = false,
  captureHint = "",
  onCapture,
  onScreenshotConsumed,
  onCancel: _onCancel,
  onCreated,
  onView,
}: Props) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [created, setCreated] = React.useState<WidgetPost | null>(null);
  const [similar, setSimilar] = React.useState<SimilarPost[]>([]);
  const [uploadedImages, setUploadedImages] = React.useState<UploadedImage[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadedImagesRef = React.useRef<UploadedImage[]>([]);

  React.useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  const atImageLimit = uploadedImages.length >= POST_MAX_IMAGES;

  React.useEffect(() => {
    if (captureHint) setMessage(captureHint);
  }, [captureHint]);

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
        if (!canceled) setSimilar(parseSimilarPosts(data.posts));
      } catch {
        if (!canceled) setSimilar([]);
      }
    }, 300);
    return () => {
      canceled = true;
      window.clearTimeout(timer);
    };
  }, [apiBase, boardId, title]);

  const uploadFile = async (file: File) => {
    if (!boardId) {
      setMessage("Pick a board first.");
      return false;
    }
    if (uploadedImagesRef.current.length >= POST_MAX_IMAGES) {
      setMessage(`You can add up to ${POST_MAX_IMAGES} images.`);
      return false;
    }
    if (!isAllowedImageType(file.type, IMAGE_UPLOAD_CONTENT_TYPES)) {
      setMessage("Use a PNG, JPEG, WebP, or GIF.");
      return false;
    }
    if (file.size > POST_IMAGE_UPLOAD_MAX_BYTES) {
      setMessage("Images need to be 5MB or smaller.");
      return false;
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

      setUploadedImages((prev) => [
        ...prev,
        { url: data.publicUrl, name: file.name, type: file.type },
      ]);
      return true;
    } catch {
      setMessage("That image couldn’t be added.");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = async (index: number) => {
    const removed = uploadedImagesRef.current[index];
    setUploadedImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    if (!removed?.url) return;
    const fingerprint =
      userId || identity?.email ? undefined : await getBrowserFingerprint();
    await deleteWidgetUploadedImage({
      apiBase,
      url: removed.url,
      userId,
      identity,
      fingerprint,
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!files.length) return;

    const remaining = Math.max(0, POST_MAX_IMAGES - uploadedImagesRef.current.length);
    const accepted = files.slice(0, remaining);
    if (files.length > accepted.length) {
      setMessage(`You can add up to ${POST_MAX_IMAGES} images.`);
    }
    for (const file of accepted) {
      await uploadFile(file);
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
        image: uploadedImages[0]?.url,
        images: uploadedImages.length
          ? uploadedImages.map((item) => ({
              url: item.url,
              name: item.name,
              type: item.type,
            }))
          : undefined,
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const createdPost = parseWidgetPost(data.post);
      if (!createdPost) throw new Error("Failed");
      const post: WidgetPost = {
        ...createdPost,
        upvotes: createdPost.upvotes ?? 1,
        commentCount: createdPost.commentCount ?? 0,
        roadmapStatus: createdPost.roadmapStatus ?? "pending",
        createdAt: createdPost.createdAt ?? new Date().toISOString(),
        boardId,
        boardName: selectedBoard?.name || null,
        boardSlug: selectedBoard?.slug || null,
        isAnonymous: createdPost.isAnonymous ?? !(userId || identity?.email),
        authorName: identity?.name || createdPost.authorName || null,
        authorImage: createdPost.authorImage || identity?.avatar || null,
        hasVoted: true,
      };
      onCreated(post);
      setCreated(post);
      setTitle("");
      setContent("");
      setSimilar([]);
      setUploadedImages([]);
    } catch {
      setMessage("Couldn’t send this. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (screenshotUrl) {
    return (
      <ScreenshotAnnotator
        imageUrl={screenshotUrl}
        accent={accent}
        ink={ink}
        attaching={uploading}
        onCancel={onScreenshotConsumed}
        onAttach={async (dataUrl) => {
          const file = await dataUrlToImageFile(dataUrl, "screenshot.jpg");
          const ok = await uploadFile(file);
          if (ok) onScreenshotConsumed();
        }}
      />
    );
  }

  if (created) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="size-5" strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-[15px] font-semibold tracking-tight text-[rgb(var(--widget-fg))]">
          Thanks for the feedback
        </p>
        <p className="mt-1.5 max-w-[240px] text-sm leading-relaxed text-[rgb(var(--widget-fg)/0.5)]">
          The team will take a look. You can keep browsing or open your request.
        </p>
        <Button
          type="button"
          variant="plain"
          onClick={() => onView(created)}
          className="mt-6 h-10 cursor-pointer rounded-md bg-[rgb(var(--widget-cta))] px-5 text-sm font-semibold text-[rgb(var(--widget-cta-fg))] hover:opacity-90"
        >
          View request
        </Button>
      </div>
    );
  }

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
        className="min-h-0 flex-1 resize-none px-0 py-2 text-base leading-relaxed text-[rgb(var(--widget-fg)/0.85)] shadow-none placeholder:text-[rgb(var(--widget-fg)/0.25)] focus-visible:ring-0"
      />

      {uploadedImages.length ? (
        <WidgetImageStrip
          urls={uploadedImages.map((item) => item.url)}
          alt={title.trim() || "Attached image"}
          className="mt-2 shrink-0"
          onRemove={(index) => void removeUploadedImage(index)}
          removeDisabled={uploading}
        />
      ) : null}

      {similar.length ? (
        <div className="-mx-5 mt-3 border-t border-dashed border-[rgb(var(--widget-fg)/0.14)]">
          <p className="px-5 pt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[rgb(var(--widget-fg)/0.45)]">
            Similar requests
          </p>
          <ul>
            {similar.slice(0, 3).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() =>
                    onView({
                      id: item.id,
                      title: item.title,
                      slug: item.slug,
                      content: null,
                      upvotes: item.upvotes,
                      commentCount: null,
                      roadmapStatus: "pending",
                      createdAt: null,
                      boardId: item.boardId,
                      boardName: selectedBoard?.name || null,
                      boardSlug: selectedBoard?.slug || null,
                      isAnonymous: null,
                      authorName: null,
                      authorImage: null,
                      hasVoted: false,
                    })
                  }
                  className="flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-left"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[rgb(var(--widget-fg))]">
                    {item.title}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 tabular-nums text-xs text-[rgb(var(--widget-fg)/0.4)]">
                    <Heart className="size-3.5" />
                    {item.upvotes || 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-4">
        <div className={widgetToolbarShellClass}>
          <div className={widgetToolbarInnerClass}>
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_UPLOAD_CONTENT_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            disabled={uploading || capturing || atImageLimit}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || capturing || atImageLimit}
            className={`${widgetToolbarItemClass} flex size-8 cursor-pointer items-center justify-center text-[rgb(var(--widget-fg)/0.45)] hover:text-[rgb(var(--widget-fg))] disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label="Add image"
          >
            {uploading ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </button>
          {uploadedImages.length ? (
            <>
              <div className={widgetToolbarSeparatorClass} />
              <span className="flex h-full items-center px-2.5 text-[11px] tabular-nums text-[rgb(var(--widget-fg)/0.45)]">
                {uploadedImages.length}/{POST_MAX_IMAGES}
              </span>
            </>
          ) : null}
          <div className={widgetToolbarSeparatorClass} />
          <button
            type="button"
            onClick={onCapture}
            disabled={uploading || capturing || atImageLimit}
            className={`${widgetToolbarItemClass} flex size-8 cursor-pointer items-center justify-center text-[rgb(var(--widget-fg)/0.45)] hover:text-[rgb(var(--widget-fg))] disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label="Capture screenshot"
          >
            {capturing ? (
              <LoaderIcon className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" strokeWidth={1.75} />
            )}
          </button>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          {message ? (
            <p className="truncate text-xs text-[rgb(var(--widget-fg)/0.5)]">{message}</p>
          ) : null}
          <Button
            type="submit"
            variant="plain"
            disabled={!canSubmit}
            className="h-10 shrink-0 cursor-pointer rounded-md bg-[rgb(var(--widget-cta))] px-5 text-sm font-semibold text-[rgb(var(--widget-cta-fg))] hover:opacity-90 disabled:bg-[rgb(var(--widget-fg)/0.2)] disabled:text-[rgb(var(--widget-fg)/0.35)]"
          >
            {submitting ? <LoaderIcon className="size-4 animate-spin" /> : "Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}

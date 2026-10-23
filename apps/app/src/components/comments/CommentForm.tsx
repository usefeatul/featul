"use client";

import React, { useEffect, useState, useRef } from "react";
import Emoji from "./emoji";
import Visibility from "./visibility";
import MentionList from "./MentionList";
import { MentionTextarea } from "./MentionTextarea";
import { Button } from "@featul/ui/components/button";
import {
  LoaderIcon,
  ImageIcon,
  CornerDownLeft,
  XMarkIcon,
} from "@/components/global/icons";

import { commentActionIconClass } from "./styles";
import ContentImage from "@/components/global/ContentImage";

import { useImageUpload } from "../../hooks/useImageUpload";
import { useMentions } from "../../hooks/useMentions";
import { useCommentSubmit } from "../../hooks/useCommentSubmit";
import type { CommentSurface } from "@/lib/comment/shared";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onBusyChange?: (busy: boolean) => void;
  placeholder?: string;
  autoFocus?: boolean;
  buttonText?: string;
  workspaceSlug?: string;
  surface?: CommentSurface;
  defaultInternal?: boolean;
  compact?: boolean;
}

export default function CommentForm({
  postId,
  parentId,
  onSuccess,
  onBusyChange,
  placeholder = "Write a comment...",
  autoFocus = false,
  buttonText = "Comment",
  workspaceSlug,
  surface = "workspace",
  defaultInternal = false,
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(defaultInternal);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canMarkInternal = surface === "workspace" && Boolean(workspaceSlug);
  const internalForced = Boolean(parentId && defaultInternal);

  const {
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  } = useImageUpload(postId);

  const {
    mentionOpen,
    mentionIndex,
    filteredCandidates,
    checkForMention,
    handleKeyDown,
    insertMention,
    members,
  } = useMentions(workspaceSlug, content, setContent, textareaRef);
  const mentionNames = React.useMemo(
    () => members.map((member) => member.name).filter(Boolean),
    [members],
  );

  const resetForm = () => {
    setContent("");
    setUploadedImage(null);
    setIsInternal(defaultInternal);
  };

  const { isPending, handleSubmit } = useCommentSubmit({
    postId,
    parentId,
    surface,
    onSuccess,
    resetForm,
  });

  const isBusy = isPending || uploadingImage;
  const canSubmit = Boolean(content.trim() || uploadedImage) && !isBusy;
  const submitLabel =
    internalForced || isInternal ? "Add internal note" : buttonText;
  useEffect(() => {
    onBusyChange?.(isBusy);
    return () => onBusyChange?.(false);
  }, [isBusy, onBusyChange]);

  return (
    <form
      onSubmit={(e) =>
        handleSubmit(e, content, uploadedImage, internalForced || isInternal)
      }
      className="space-y-2.5"
    >
      <div className="relative">
        <MentionTextarea
          ref={textareaRef}
          value={content}
          mentionNames={mentionNames}
          onChange={(e) => {
            const next = e.target.value;
            setContent(next);
            const caret = e.target.selectionStart || next.length;
            checkForMention(next, caret);
          }}
          placeholder={placeholder}
          compact={compact}
          autoFocus={autoFocus}
          disabled={isPending || uploadingImage}
          onKeyDown={handleKeyDown}
        />

        {mentionOpen &&
          filteredCandidates.length > 0 &&
          textareaRef.current && (
            <MentionList
              candidates={filteredCandidates.map((u) => ({
                id: u.userId,
                name: u.name,
                email: u.email,
                image: u.image,
              }))}
              selectedIndex={mentionIndex}
              onSelect={(user) => insertMention(user.name)}
              className="left-2 top-full mt-1"
            />
          )}
      </div>

      {/* Image Preview */}
      {uploadedImage && (
        <div className="relative inline-block">
          <ContentImage
            url={uploadedImage.previewUrl || uploadedImage.url}
            alt={uploadedImage.name}
            className="h-16 w-24"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage()}
            className="absolute -top-1.5 -right-1.5 z-20 flex size-4 cursor-pointer items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-md ring-1 ring-background hover:bg-destructive/90"
            disabled={isPending || uploadingImage}
            aria-label="Remove image"
          >
            <XMarkIcon className="size-2.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isPending || uploadingImage}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="plain"
            className={commentActionIconClass}
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || uploadingImage || !!uploadedImage}
            aria-label="Add image"
          >
            {uploadingImage ? (
              <LoaderIcon className="h-4 w-4" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </Button>

          <Emoji
            value={content}
            onChange={setContent}
            textareaRef={textareaRef}
            disabled={isBusy}
          />
          {canMarkInternal && (
            <Visibility
              internal={isInternal}
              onChange={setIsInternal}
              disabled={isBusy}
              forced={internalForced}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="icon-sm"
            variant="default"
            disabled={!canSubmit}
            aria-label={submitLabel}
            title={submitLabel}
            aria-busy={isPending}
          >
            {isPending ? (
              <LoaderIcon className="size-3.5" />
            ) : (
              <CornerDownLeft className="size-4" strokeWidth={2.25} />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

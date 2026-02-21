"use client"

import React, { useState, useRef } from "react"
import MentionList from "./MentionList"
import { Textarea } from "@featul/ui/components/textarea"
import { Button } from "@featul/ui/components/button"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { ImageIcon } from "@featul/ui/icons/image"
import { LockIcon } from "@featul/ui/icons/lock"
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip"
import { cn } from "@featul/ui/lib/utils"
import ContentImage from "@/components/global/ContentImage"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { useImageUpload } from "../../hooks/useImageUpload"
import { useMentions } from "../../hooks/useMentions"
import { useCommentSubmit } from "../../hooks/useCommentSubmit"

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  buttonText?: string
  workspaceSlug?: string
  surface?: "workspace" | "public"
  defaultInternal?: boolean
}

export default function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
  buttonText = "Comment",
  workspaceSlug,
  surface = "workspace",
  defaultInternal = false,
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isInternal, setIsInternal] = useState(defaultInternal)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canMarkInternal = surface === "workspace" && Boolean(workspaceSlug)
  const internalForced = Boolean(parentId && defaultInternal)

  const {
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  } = useImageUpload(postId)

  const {
    mentionOpen,
    mentionIndex,
    filteredCandidates,
    checkForMention,
    handleKeyDown,
    insertMention,
  } = useMentions(workspaceSlug, content, setContent, textareaRef)

  const resetForm = () => {
    setContent("")
    setUploadedImage(null)
    setIsInternal(defaultInternal)
  }

  const { isPending, handleSubmit } = useCommentSubmit({
    postId,
    parentId,
    surface,
    onSuccess,
    resetForm,
  })

  return (
    <form
      onSubmit={(e) =>
        handleSubmit(e, content, uploadedImage, internalForced || isInternal)
      }
      className="space-y-2.5"
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            const next = e.target.value
            setContent(next)
            const caret = e.target.selectionStart || next.length
            checkForMention(next, caret)
          }}
          placeholder={placeholder}
          className="min-h-[60px] resize-none text-sm shadow-none placeholder:text-accent border-none focus-visible:ring-0"
          autoFocus={autoFocus}
          disabled={isPending || uploadingImage}
          onKeyDown={handleKeyDown}
        />

        {mentionOpen && filteredCandidates.length > 0 && textareaRef.current && (
          <MentionList
            candidates={filteredCandidates.map(u => ({ id: u.userId, ...u }))}
            selectedIndex={mentionIndex}
            onSelect={(user) => insertMention(user.name)}
            className="left-2 top-full mt-1"
          />
        )}
      </div>

      {/* Image Preview */}
      {uploadedImage && (
        <div className="relative inline-block">
          <div className="relative">
            <ContentImage
              url={uploadedImage.url}
              alt={uploadedImage.name}
              className="max-w-[120px] max-h-20"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 rounded-xl bg-destructive text-destructive-foreground p-0.5 hover:bg-destructive/90 transition-colors z-10 cursor-pointer"
              disabled={isPending || uploadingImage}
              aria-label="Remove image"
            >
              <XMarkIcon className="size-3" />
            </button>
          </div>
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
            size="xs"
            variant="card"
            className="h-8 w-8 p-0 rounded-md dark:bg-black/40"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || uploadingImage || !!uploadedImage}
            aria-label="Add image"
          >
            {uploadingImage ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4 " />
            )}
          </Button>

          {canMarkInternal && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="xs"
                  variant="card"
                  onClick={() => setIsInternal((prev) => !prev)}
                  className={cn(
                    "h-8 w-8 p-0 rounded-md dark:bg-black/40",
                    isInternal && "bg-muted text-foreground border-border/80"
                  )}
                  disabled={isPending || uploadingImage || internalForced}
                  aria-label={
                    isInternal
                      ? "Disable internal comment"
                      : "Enable internal comment"
                  }
                  aria-pressed={isInternal}
                >
                  <LockIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4} className="w-auto whitespace-nowrap px-2 py-1 text-xs">
                {internalForced
                  ? "Internal reply"
                  : isInternal
                    ? "Internal only"
                    : "Make internal"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="xs"
            variant="card"
            disabled={
              (!content.trim() && !uploadedImage) || isPending || uploadingImage
            }
          >
            {isPending ? (
              <LoaderIcon className="h-3 w-3 animate-spin" />
            ) : (
              buttonText
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              size="xs"
              variant="nav"
              onClick={onCancel}
              disabled={isPending || uploadingImage}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

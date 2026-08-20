"use client"

import React, { useState, useRef } from "react"
import MentionList from "./MentionList"
import { Textarea } from "@featul/ui/components/textarea"
import { Button } from "@featul/ui/components/button"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { ImageIcon } from "@featul/ui/icons/image"
import { LockIcon } from "@featul/ui/icons/lock"
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip"
import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import ContentImage from "@/components/global/ContentImage"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { useImageUpload } from "../../hooks/useImageUpload"
import { useMentions } from "../../hooks/useMentions"
import { useCommentSubmit } from "../../hooks/useCommentSubmit"
import type { CommentSurface } from "@/lib/comment/shared"

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  buttonText?: string
  workspaceSlug?: string
  surface?: CommentSurface
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
          variant="plain"
          className="min-h-[60px] resize-none text-sm"
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
          <ContentImage
            url={uploadedImage.url}
            alt={uploadedImage.name}
            className="h-16 w-24"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage()}
            className="absolute -top-1.5 -right-1.5 z-20 flex size-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md ring-1 ring-background hover:bg-destructive/90"
            disabled={isPending || uploadingImage}
            aria-label="Remove image"
          >
            <XMarkIcon className="size-2.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Toolbar size="sm" className="w-fit">
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
            variant="plain"
            className={cn(toolbarItemClass, "w-8 px-0 text-accent hover:text-foreground")}
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || uploadingImage || !!uploadedImage}
            aria-label="Add image"
          >
            {uploadingImage ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </Button>

          {canMarkInternal && (
            <>
              <ToolbarSeparator />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="xs"
                    variant="plain"
                    onClick={() => setIsInternal((prev) => !prev)}
                    className={cn(
                      toolbarItemClass,
                      "w-8 px-0",
                      isInternal && "bg-muted/40 text-green-600 dark:text-green-400",
                    )}
                    disabled={isPending || uploadingImage || internalForced}
                    aria-label={
                      isInternal
                        ? "Disable internal comment"
                        : "Enable internal comment"
                    }
                    aria-pressed={isInternal}
                  >
                    <LockIcon
                      className={cn(
                        "size-4",
                        isInternal && "text-green-600 dark:text-green-400"
                      )}
                    />
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
            </>
          )}
        </Toolbar>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="xs"
            variant="card"
            className="dark:border-white/10 dark:bg-black"
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
              variant="card"
              className="dark:border-white/10 dark:bg-black"
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

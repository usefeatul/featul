"use client"

import React, { useState, useRef } from "react"
import MentionList from "./MentionList"
import { Textarea } from "@oreilla/ui/components/textarea"
import { Button } from "@oreilla/ui/components/button"
import { LoaderIcon } from "@oreilla/ui/icons/loader"
import { ImageIcon } from "@oreilla/ui/icons/image"
import ContentImage from "@/components/global/ContentImage"
import { XMarkIcon } from "@oreilla/ui/icons/xmark"
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
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
  }

  const { isPending, handleSubmit } = useCommentSubmit({
    postId,
    parentId,
    onSuccess,
    resetForm,
  })

  return (
    <form
      onSubmit={(e) => handleSubmit(e, content, uploadedImage)}
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
          className="min-h-[60px] resize-none text-sm shadow-none bg-background placeholder:text-accent border-none focus-visible:ring-0"
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
            variant="nav"
            className="h-8 w-8 p-0 rounded-full dark:bg-black/40"
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
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="xs"
            variant="nav"
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

"use client"

import React from "react"
import { Input } from "@featul/ui/components/input"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import ContentImage from "@/components/global/ContentImage"
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize"

export interface UploadedImage {
  url: string
  name: string
  type: string
}

export interface PostContentProps {
  title: string
  setTitle: (value: string) => void
  content: string
  setContent: (value: string) => void
  uploadedImage: UploadedImage | null
  uploadingImage: boolean
  handleRemoveImage: () => void
}

export function PostContent({
  title,
  setTitle,
  content,
  setContent,
  uploadedImage,
  uploadingImage,
  handleRemoveImage,
}: PostContentProps) {
  return (
    <div className="px-3 md:px-4 flex flex-col gap-2">
      <Input
        variant="plain"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        maxLength={100}
        className="text-lg md:text-xl  font-semibold h-auto py-2 placeholder:text-accent "
      />
      <TextareaAutosize
        placeholder="Add post contentss"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        minRows={2}
        maxRows={10}
        className="w-full resize-none min-h-[72px] max-h-[32dvh] overflow-y-auto py-2 text-base placeholder:text-accent wrap-break-word border-none outline-none"
      />
      
      {/* Image Preview */}
      {uploadedImage && (
        <div className="relative inline-block w-fit mb-2">
          <div className="relative">
            <ContentImage
              url={uploadedImage.url}
              alt={uploadedImage.name}
              className="w-40 ring-1 ring-border"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/90 transition-colors shadow-sm z-10"
              disabled={uploadingImage}
              aria-label="Remove image"
            >
              <XMarkIcon className="size-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import React from "react"
import { Input } from "@feedgot/ui/components/input"
import { Textarea } from "@feedgot/ui/components/textarea"
import { XMarkIcon } from "@feedgot/ui/icons/xmark"

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
        maxLength={128}
        className="text-lg md:text-xl font-semibold h-auto py-2 placeholder:text-accent "
      />
      <Textarea
        variant="plain"
        placeholder="Add post content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="resize-none min-h-[80px] py-2 text-base placeholder:text-accent "
        required
      />
      
      {/* Image Preview */}
      {uploadedImage && (
        <div className="relative inline-block w-fit">
          <div className="relative">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage.url}
              alt={uploadedImage.name}
              className="max-w-full h-auto max-h-48 rounded-md border"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 hover:bg-destructive/90 transition-colors shadow-sm"
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


"use client"

import React from "react"
import { Button } from "@oreilla/ui/components/button"
import { LoaderIcon } from "@oreilla/ui/icons/loader"
import { ImageIcon } from "lucide-react"
import { UploadedImage } from "./PostContent"

export interface PostFooterProps {
  isPending: boolean
  disabled: boolean
  uploadedImage: UploadedImage | null
  uploadingImage: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  ALLOWED_IMAGE_TYPES: string[]
  submitLabel?: string
}

export function PostFooter({ 
  isPending, 
  disabled, 
  uploadedImage, 
  uploadingImage, 
  fileInputRef, 
  handleFileSelect,
  ALLOWED_IMAGE_TYPES,
  submitLabel = "Create"
}: PostFooterProps) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 bg-muted dark:bg-black/50">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadingImage}
        />
        <Button
          type="button"
          size="xs"
          variant="nav"
          className="h-8 w-8 p-0 rounded-full text-accent hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage || !!uploadedImage}
          aria-label="Add image"
        >
          {uploadingImage ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="size-5" />
          )}
        </Button>
      </div>

      <Button
        type="submit"
        variant="default"
        disabled={disabled}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
      >
        {isPending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? (submitLabel === "Create" ? "Creating..." : "Saving...") : submitLabel}
      </Button>
    </div>
  )
}

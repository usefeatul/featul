"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { ImageIcon } from "lucide-react"
import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import type { UploadedImage } from "./PostContent"

export interface PostFooterProps {
  isPending: boolean
  disabled: boolean
  uploadedImages: UploadedImage[]
  uploadingImage: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  ALLOWED_IMAGE_TYPES: string[]
  maxImages?: number
  submitLabel?: string
}

export function PostFooter({ 
  isPending, 
  disabled, 
  uploadedImages, 
  uploadingImage, 
  fileInputRef, 
  handleFileSelect,
  ALLOWED_IMAGE_TYPES,
  maxImages = 5,
  submitLabel = "Create"
}: PostFooterProps) {
  const atLimit = uploadedImages.length >= maxImages

  return (
    <div className="flex items-center justify-between p-3 md:p-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadingImage || atLimit}
          multiple={maxImages > 1}
        />
        <Toolbar size="sm" className="w-fit">
          <Button
            type="button"
            variant="plain"
            size="xs"
            className={cn(toolbarItemClass, "w-8 px-0 text-accent hover:text-foreground")}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || atLimit}
            aria-label="Add image"
          >
            {uploadingImage ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4" />
            )}
          </Button>
          {uploadedImages.length > 0 ? (
            <>
              <ToolbarSeparator />
              <span className="flex h-full items-center px-2.5 text-[11px] tabular-nums text-accent">
                {uploadedImages.length}/{maxImages}
              </span>
            </>
          ) : null}
        </Toolbar>
      </div>

      <Button
        type="submit"
        variant="default"
        disabled={disabled}
        aria-keyshortcuts="Meta+Enter Control+Enter"
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
      >
        {isPending && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? (submitLabel === "Create" ? "Creating..." : "Saving...") : submitLabel}
      </Button>
    </div>
  )
}

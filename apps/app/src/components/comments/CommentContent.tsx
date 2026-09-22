"use client"

import React from "react"
import ContentImage from "@/components/global/ContentImage"
import { ImageLightbox } from "@/components/global/ImageLightbox"
import type { CommentData } from "../../types/comment"
import { renderCommentMentions } from "./mentionText"

interface CommentContentProps {
  content: string
  metadata?: CommentData["metadata"]
}

export default function CommentContent({ content, metadata }: CommentContentProps) {
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null)
  const imageAttachments = (metadata?.attachments || []).filter((att) =>
    att.type.startsWith("image/"),
  )
  const lightboxImages = imageAttachments.map((att) => ({
    url: att.url,
    alt: att.name,
  }))
  const renderText = () => {
    const text = content || ""
    const mentions = (metadata?.mentions || []).map((mention) => mention || "")
    return renderCommentMentions(text, mentions)
  }

  return (
    <>
      {content && (
        <div className="text-sm text-foreground/90 whitespace-pre-wrap wrap-break-word leading-7 font-normal">
          {renderText()}
        </div>
      )}
      {/* Display images from metadata */}
      {imageAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {imageAttachments.map((att, idx) => (
              <ContentImage
                key={idx}
                url={att.url}
                alt={att.name}
                className="h-16 w-24"
                onPreview={() => setViewerIndex(idx)}
              />
            ))}
        </div>
      )}
      <ImageLightbox
        open={viewerIndex !== null}
        onOpenChange={(open) => {
          if (!open) setViewerIndex(null)
        }}
        images={lightboxImages}
        index={viewerIndex ?? 0}
        onIndexChange={setViewerIndex}
      />
    </>
  )
}

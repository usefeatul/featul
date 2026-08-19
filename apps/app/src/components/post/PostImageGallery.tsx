"use client"

import React from "react"
import ContentImage from "@/components/global/ContentImage"
import { listPostImages } from "@/lib/post-images"

export function PostImageGallery({
  image,
  metadata,
  alt,
  className = "h-40 w-auto max-w-full rounded-md",
}: {
  image: string | null | undefined
  metadata?: unknown
  alt: string
  className?: string
}) {
  const images = listPostImages(image, metadata)
  if (images.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {images.map((item, index) => (
        <ContentImage
          key={item.url}
          url={item.url}
          alt={images.length > 1 ? `${alt} ${index + 1}` : alt}
          className={className}
        />
      ))}
    </div>
  )
}

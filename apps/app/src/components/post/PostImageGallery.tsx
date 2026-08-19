"use client"

import React from "react"
import ContentImage from "@/components/global/ContentImage"
import { listPostImages } from "@/lib/post-images"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { cn } from "@featul/ui/lib/utils"

type GalleryImage = {
  url: string
  name?: string
}

export function PostImageGallery({
  image,
  metadata,
  items,
  alt,
  className,
  onRemove,
  removeDisabled,
}: {
  image?: string | null
  metadata?: unknown
  items?: GalleryImage[]
  alt: string
  className?: string
  onRemove?: (index: number) => void
  removeDisabled?: boolean
}) {
  const images = items ?? listPostImages(image, metadata)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const previousCountRef = React.useRef(0)

  React.useEffect(() => {
    if (images.length > previousCountRef.current) {
      scrollerRef.current?.scrollTo({
        left: scrollerRef.current.scrollWidth,
        behavior: "smooth",
      })
    }
    previousCountRef.current = images.length
  }, [images.length])

  if (images.length === 0) {
    return null
  }

  return (
    <div className={cn("min-w-0", className)}>
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
      >
        {images.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            className="relative shrink-0 snap-start"
          >
            <ContentImage
              url={item.url}
              alt={item.name || (images.length > 1 ? `${alt} ${index + 1}` : alt)}
              className="h-24 w-32 rounded-md"
            />
            {onRemove ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove(index)
                }}
                className="absolute -top-1.5 -right-1.5 z-10 cursor-pointer rounded-full bg-destructive p-0.5 text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
                disabled={removeDisabled}
                aria-label={`Remove ${item.name || `image ${index + 1}`}`}
              >
                <XMarkIcon className="size-3" />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

"use client"

import React from "react"
import ContentImage from "@/components/global/ContentImage"
import { listPostImages } from "@/lib/post-images"
import { Button } from "@featul/ui/components/button"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { cn } from "@featul/ui/lib/utils"

const VISIBLE_COUNT = 3

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
  const [start, setStart] = React.useState(0)
  const imageKey = images.map((item) => item.url).join("|")
  const previousCountRef = React.useRef(0)

  React.useEffect(() => {
    const maxStart = Math.max(0, images.length - VISIBLE_COUNT)
    if (images.length > previousCountRef.current) {
      setStart(maxStart)
    } else {
      setStart((value) => Math.min(value, maxStart))
    }
    previousCountRef.current = images.length
  }, [imageKey, images.length])

  if (images.length === 0) {
    return null
  }

  const maxStart = Math.max(0, images.length - VISIBLE_COUNT)
  const windowStart = Math.min(start, maxStart)
  const visible = images.slice(windowStart, windowStart + VISIBLE_COUNT)
  const canPage = images.length > VISIBLE_COUNT

  return (
    <div className={cn("w-fit max-w-full", className)}>
      <div className="flex items-center gap-1.5">
        {canPage ? (
          <Button
            type="button"
            size="xs"
            variant="card"
            className="h-6 w-6 shrink-0 p-0"
            onClick={() => setStart((value) => Math.max(0, value - 1))}
            disabled={windowStart === 0}
            aria-label="Previous images"
          >
            <ChevronLeftIcon className="size-3" />
          </Button>
        ) : null}

        <div
          className={cn(
            "grid gap-1.5",
            images.length === 1 && "grid-cols-1",
            images.length === 2 && "grid-cols-2",
            images.length >= VISIBLE_COUNT && "grid-cols-3"
          )}
        >
          {visible.map((item, offset) => {
            const itemIndex = windowStart + offset
            return (
              <div key={`${item.url}-${itemIndex}`} className="relative">
                <ContentImage
                  url={item.url}
                  alt={item.name || (images.length > 1 ? `${alt} ${itemIndex + 1}` : alt)}
                  className="h-[4.5rem] w-20 rounded-md"
                />
                {onRemove ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onRemove(itemIndex)
                    }}
                    className="absolute -top-1.5 -right-1.5 z-10 cursor-pointer rounded-full bg-destructive p-0.5 text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
                    disabled={removeDisabled}
                    aria-label={`Remove ${item.name || `image ${itemIndex + 1}`}`}
                  >
                    <XMarkIcon className="size-3" />
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>

        {canPage ? (
          <Button
            type="button"
            size="xs"
            variant="card"
            className="h-6 w-6 shrink-0 p-0"
            onClick={() => setStart((value) => Math.min(maxStart, value + 1))}
            disabled={windowStart >= maxStart}
            aria-label="Next images"
          >
            <ChevronRightIcon className="size-3" />
          </Button>
        ) : null}
      </div>

      {canPage ? (
        <p className="mt-1.5 text-[11px] text-accent">
          {windowStart + 1}–{windowStart + visible.length} of {images.length}
        </p>
      ) : null}
    </div>
  )
}

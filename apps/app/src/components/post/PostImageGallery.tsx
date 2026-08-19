"use client"

import React from "react"
import ContentImage from "@/components/global/ContentImage"
import { listPostImages } from "@/lib/post-images"
import { Button } from "@featul/ui/components/button"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right"
import { cn } from "@featul/ui/lib/utils"

const VISIBLE_COUNT = 3

export function PostImageGallery({
  image,
  metadata,
  alt,
  className,
}: {
  image: string | null | undefined
  metadata?: unknown
  alt: string
  className?: string
}) {
  const images = listPostImages(image, metadata)
  const [start, setStart] = React.useState(0)
  const imageKey = images.map((item) => item.url).join("|")

  React.useEffect(() => {
    setStart(0)
  }, [imageKey])

  if (images.length === 0) {
    return null
  }

  const maxStart = Math.max(0, images.length - VISIBLE_COUNT)
  const windowStart = Math.min(start, maxStart)
  const visible = images.slice(windowStart, windowStart + VISIBLE_COUNT)
  const canPage = images.length > VISIBLE_COUNT

  const goPrev = () => setStart((value) => Math.max(0, value - 1))
  const goNext = () => setStart((value) => Math.min(maxStart, value + 1))

  return (
    <div className={cn("w-fit max-w-full", className)}>
      <div className="flex items-center gap-1.5">
        {canPage ? (
          <Button
            type="button"
            size="xs"
            variant="card"
            className="h-6 w-6 shrink-0 p-0"
            onClick={goPrev}
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
              <ContentImage
                key={item.url}
                url={item.url}
                alt={images.length > 1 ? `${alt} ${itemIndex + 1}` : alt}
                className="h-[4.5rem] w-20 rounded-md"
              />
            )
          })}
        </div>

        {canPage ? (
          <Button
            type="button"
            size="xs"
            variant="card"
            className="h-6 w-6 shrink-0 p-0"
            onClick={goNext}
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

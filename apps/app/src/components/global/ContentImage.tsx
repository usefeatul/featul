"use client";

import { useState } from "react";
import Image from "next/image";
import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { ImageLightbox } from "@/components/global/ImageLightbox";

interface ContentImageProps {
  url: string;
  alt: string;
  className?: string;
  onPreview?: () => void;
}

export default function ContentImage({
  url,
  alt,
  className,
  onPreview,
}: ContentImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = () => {
    if (onPreview) {
      onPreview();
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          overlayShellClass,
          "relative cursor-pointer p-0.5 transition-opacity hover:opacity-90",
          className,
        )}
        onClick={openPreview}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPreview();
          }
        }}
        aria-label="Click to view full size image"
      >
        <div className={overlayInnerClass}>
          <div className="relative aspect-video h-full w-full min-h-[60px] bg-background">
            <Image
              src={url}
              alt={alt}
              fill
              className="object-cover"
              unoptimized
              loader={({ src }) => src}
            />
          </div>
        </div>
      </div>

      {onPreview ? null : (
        <ImageLightbox
          open={isOpen}
          onOpenChange={setIsOpen}
          images={[{ url, alt }]}
          index={0}
          onIndexChange={() => undefined}
        />
      )}
    </>
  );
}

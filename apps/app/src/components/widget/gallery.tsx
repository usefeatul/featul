"use client";

import * as React from "react";
import { X } from "lucide-react";
import { ImageLightbox } from "@/components/global/ImageLightbox";
import { WidgetImage } from "./image";
import { isSafeImageUrl, postToParent, useParentOrigin } from "./messaging";

type Props = {
  urls: string[];
  alt: string;
  className?: string;
  onRemove?: (index: number) => void;
  removeDisabled?: boolean;
};

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function WidgetImageStrip({
  urls,
  alt,
  className = "",
  onRemove,
  removeDisabled = false,
}: Props) {
  const parentOrigin = useParentOrigin();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const previousCountRef = React.useRef(0);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (urls.length > previousCountRef.current) {
      scrollerRef.current?.scrollTo({
        left: scrollerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
    previousCountRef.current = urls.length;
  }, [urls.length]);

  if (urls.length === 0) {
    return null;
  }

  const removable = Boolean(onRemove);
  const lightboxImages = urls.map((url, index) => ({
    url,
    alt: urls.length > 1 ? `${alt} ${index + 1}` : alt,
  }));

  const openAt = (index: number) => {
    const item = lightboxImages[index];
    if (!item || !isSafeImageUrl(item.url)) return;
    if (isInIframe()) {
      postToParent(parentOrigin, "open-image", {
        url: item.url,
        alt,
        urls: lightboxImages.map((image) => image.url),
        index,
      });
      return;
    }
    setViewerIndex(index);
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <div
        ref={scrollerRef}
        className={`flex gap-1.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory [-webkit-overflow-scrolling:touch] ${
          removable ? "pt-2.5 pb-1 pr-1.5" : "pt-1 pb-1"
        }`}
      >
        {urls.map((url, index) => (
          <div key={`${url}-${index}`} className="relative shrink-0 snap-start">
            <WidgetImage
              url={url}
              alt={urls.length > 1 ? `${alt} ${index + 1}` : alt}
              className="h-16 w-24"
              onPreview={() => openAt(index)}
            />
            {onRemove ? (
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={removeDisabled}
                className="absolute -top-1.5 -right-1.5 z-20 flex size-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md ring-1 ring-[rgb(var(--widget-surface))] hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="size-2.5" />
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <ImageLightbox
        open={viewerIndex !== null}
        onOpenChange={(open) => {
          if (!open) setViewerIndex(null);
        }}
        images={lightboxImages}
        index={viewerIndex ?? 0}
        onIndexChange={setViewerIndex}
      />
    </div>
  );
}

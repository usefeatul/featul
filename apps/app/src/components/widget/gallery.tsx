"use client";

import * as React from "react";
import { X } from "lucide-react";
import { WidgetImage } from "./image";

type Props = {
  urls: string[];
  alt: string;
  className?: string;
  onRemove?: (index: number) => void;
  removeDisabled?: boolean;
};

export function WidgetImageStrip({
  urls,
  alt,
  className = "",
  onRemove,
  removeDisabled = false,
}: Props) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const previousCountRef = React.useRef(0);

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
    </div>
  );
}

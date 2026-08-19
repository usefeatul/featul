"use client";

import * as React from "react";
import { WidgetImage } from "./image";

type Props = {
  urls: string[];
  alt: string;
  className?: string;
};

export function WidgetImageStrip({ urls, alt, className = "" }: Props) {
  if (urls.length === 0) {
    return null;
  }

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-hide snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
        {urls.map((url, index) => (
          <WidgetImage
            key={`${url}-${index}`}
            url={url}
            alt={urls.length > 1 ? `${alt} ${index + 1}` : alt}
            className="shrink-0 snap-start"
            imgClassName="h-16 w-24 object-cover"
          />
        ))}
      </div>
    </div>
  );
}

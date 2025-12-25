"use client";

import { useState } from "react";
import Image from "next/image";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { cn } from "@oreilla/ui/lib/utils";

interface ContentImageProps {
  url: string;
  alt: string;
  className?: string;
}

export default function ContentImage({
  url,
  alt,
  className,
}: ContentImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "relative rounded-md  border overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity",
          className
        )}
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label="Click to view full size image"
      >
        <div className="relative aspect-video w-full h-full min-h-[60px] bg-muted">
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

      <SettingsDialogShell
        open={isOpen}
        onOpenChange={setIsOpen}
        title={alt}
        width="xxl"
      >
        <div className="relative flex items-center justify-center overflow-auto max-h-[85vh]">
          <img
            src={url}
            alt={alt}
            className="w-full max-w-full h-auto max-h-[83vh] object-contain rounded-md"
          />
        </div>
      </SettingsDialogShell>
    </>
  );
}

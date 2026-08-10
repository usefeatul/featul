"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "@featul/ui/icons/image";
import { cn } from "@featul/ui/lib/utils";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";

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
        title="Image"
        width="xxl"
        icon={<ImageIcon className="size-3.5" />}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/40">
          <img
            src={url}
            alt={alt}
            className="max-h-[80dvh] w-full object-contain"
          />
        </div>
      </SettingsDialogShell>
    </>
  );
}

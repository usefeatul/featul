"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "@featul/ui/icons/image";
import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";
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
          overlayShellClass,
          "relative cursor-pointer p-0.5 transition-opacity hover:opacity-90",
          className,
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

      <SettingsDialogShell
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Image"
        width="xxl"
        icon={<ImageIcon className="size-3.5" />}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className={cn(overlayShellClass, "p-1")}>
          <div
            className={cn(
              overlayInnerClass,
              "flex max-h-[min(72dvh,760px)] items-center justify-center bg-background",
            )}
          >
            <img
              src={url}
              alt={alt}
              className="max-h-[min(72dvh,760px)] max-w-full h-auto w-auto object-contain"
            />
          </div>
        </div>
      </SettingsDialogShell>
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@featul/ui/components/dialog";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { cn } from "@featul/ui/lib/utils";

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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          fluid
          showCloseButton={false}
          overlayClassName="bg-black/45 backdrop-blur-md dark:bg-black/85"
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="fixed inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 items-center justify-center border-none bg-transparent p-4 shadow-none ring-0 ring-offset-0 sm:max-w-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{alt}</DialogTitle>
          </DialogHeader>
          <DialogClose
            className="absolute top-4 right-4 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/40 text-white opacity-90 transition-opacity hover:bg-black/55 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Close image preview"
          >
            <XMarkIcon size={16} />
          </DialogClose>
          <img
            src={url}
            alt={alt}
            className="max-h-[55dvh] max-w-[min(90vw,800px)] object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

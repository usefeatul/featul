"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@feedgot/ui/components/dialog";
import { cn } from "@feedgot/ui/lib/utils";

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
          "relative rounded-md border overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity",
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
        <DialogContent className="w-fit max-w-[75vw] p-0 bg-transparent border-none shadow-none ring-0 outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{alt}</DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center">
            <img
              src={url}
              alt={alt}
              className="max-w-[75vw] max-h-[75vh] w-auto h-auto object-contain rounded-md"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

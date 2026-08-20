"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogInner,
  DialogTitle,
} from "@featul/ui/components/dialog";
import { ImageIcon } from "@featul/ui/icons/image";
import { ImageLightboxNav, ImageLightboxView, type LightboxImage } from "@/components/global/ImageLightbox";
import { isSafeImageUrl } from "./messaging";

type OpenHostImageExtras = {
  urls?: string[];
  index?: number;
};

declare global {
  interface Window {
    __featulOpenHostImage?: (
      url: string,
      alt?: string,
      extras?: OpenHostImageExtras,
    ) => void;
    __featulCloseHostImage?: () => void;
  }
}

/**
 * Host-page image dialog for the embeddable widget.
 * Mirrors workspace ContentImage + SettingsDialogShell, with a z-index
 * above the widget iframe so it covers the full workspace screen.
 */
export function WidgetHostImageDialog() {
  const [open, setOpen] = React.useState(false);
  const [images, setImages] = React.useState<LightboxImage[]>([]);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const openImage = (
      nextUrl: string,
      nextAlt = "",
      extras?: OpenHostImageExtras,
    ) => {
      const galleryUrls = Array.isArray(extras?.urls)
        ? extras.urls.filter(isSafeImageUrl)
        : [];
      const nextImages =
        galleryUrls.length > 0
          ? galleryUrls.map((url, imageIndex) => ({
              url,
              alt:
                galleryUrls.length > 1
                  ? `${nextAlt || "Image"} ${imageIndex + 1}`
                  : nextAlt,
            }))
          : isSafeImageUrl(nextUrl)
            ? [{ url: nextUrl, alt: nextAlt }]
            : [];
      if (nextImages.length === 0) return;
      const nextIndex =
        typeof extras?.index === "number" ? extras.index : galleryUrls.indexOf(nextUrl);
      setImages(nextImages);
      setIndex(
        Math.min(
          Math.max(nextIndex < 0 ? 0 : nextIndex, 0),
          nextImages.length - 1,
        ),
      );
      setOpen(true);
    };
    const closeImage = () => setOpen(false);

    window.__featulOpenHostImage = openImage;
    window.__featulCloseHostImage = closeImage;

    return () => {
      if (window.__featulOpenHostImage === openImage) delete window.__featulOpenHostImage;
      if (window.__featulCloseHostImage === closeImage) delete window.__featulCloseHostImage;
    };
  }, []);

  const title =
    images.length > 1 ? `Image ${index + 1} of ${images.length}` : "Image";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        fluid
        overlayClassName="z-[2147483647] bg-black/20 backdrop-blur-xs dark:bg-black/20"
        className="z-[2147483647] max-h-[92dvh] max-w-none overflow-visible sm:max-w-none"
        style={{
          width: "min(calc(100vw - 8rem), 1400px)",
          maxWidth: "none",
          top: "50%",
          ["--tw-translate-y" as string]: "-50%",
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="mt-0.5 flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
            <ImageIcon className="size-3.5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogInner className="min-h-0 p-2">
          <ImageLightboxView
            images={images}
            index={index}
            onIndexChange={setIndex}
            enabled={open}
          />
        </DialogInner>
        {images.length > 1 ? (
          <ImageLightboxNav
            onPrev={() =>
              setIndex((current) =>
                (current - 1 + images.length) % images.length,
              )
            }
            onNext={() =>
              setIndex((current) => (current + 1) % images.length)
            }
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

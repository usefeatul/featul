"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  url: string;
  alt?: string;
  className?: string;
  /** Extra class on the thumbnail <img> */
  imgClassName?: string;
};

function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function requestHostImagePreview(url: string, alt: string) {
  if (!isInIframe()) return false;
  window.parent.postMessage(
    {
      source: "featul-widget-frame",
      type: "open-image",
      payload: { url, alt },
    },
    "*",
  );
  return true;
}

export function WidgetImage({
  url,
  alt = "",
  className = "",
  imgClassName = "h-14 w-14 object-cover",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openPreview = () => {
    // Prefer host-page lightbox so the image isn't clipped by the widget iframe.
    if (requestHostImagePreview(url, alt)) return;
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className={`inline-block cursor-pointer overflow-hidden rounded-md bg-[rgb(var(--widget-fg)/0.04)] transition-opacity hover:opacity-90 ${className}`}
        aria-label="View full size image"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className={imgClassName} />
      </button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
              role="dialog"
              aria-modal="true"
              aria-label="Image preview"
              onClick={() => setOpen(false)}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close image"
              >
                <X className="size-4" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={alt}
                className="max-h-[85dvh] max-w-[min(100%,42rem)] rounded-md object-contain"
                onClick={(event) => event.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

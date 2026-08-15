"use client";

import * as React from "react";
import { ImageIcon } from "@featul/ui/icons/image";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { isSafeImageUrl, postToParent, useParentOrigin } from "./messaging";

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

function requestHostImagePreview(parentOrigin: string, url: string, alt: string) {
  if (!isInIframe()) return false;
  postToParent(parentOrigin, "open-image", { url, alt });
  return true;
}

export function WidgetImage({
  url,
  alt = "",
  className = "",
  imgClassName = "h-14 w-14 object-cover",
}: Props) {
  const parentOrigin = useParentOrigin();
  const [open, setOpen] = React.useState(false);

  if (!isSafeImageUrl(url)) return null;

  const openPreview = () => {
    // Prefer host-page lightbox so the image isn't clipped by the widget iframe.
    if (requestHostImagePreview(parentOrigin, url, alt)) return;
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

      <SettingsDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Image"
        width="xxl"
        icon={<ImageIcon className="size-3.5" />}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt} className="max-h-[80dvh] w-full object-contain" />
        </div>
      </SettingsDialogShell>
    </>
  );
}

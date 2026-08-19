"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon } from "@featul/ui/icons/image";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { isSafeImageUrl, postToParent, useParentOrigin } from "./messaging";

type Props = {
  url: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  preview?: boolean;
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

function WidgetImg({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  return (
    <Image
      src={url}
      alt={alt}
      width={1200}
      height={1200}
      unoptimized
      loader={({ src }) => src}
      className={className}
    />
  );
}

export function WidgetImage({
  url,
  alt = "",
  className = "",
  imgClassName = "h-14 w-14 object-cover",
  preview = true,
}: Props) {
  const parentOrigin = useParentOrigin();
  const [open, setOpen] = React.useState(false);

  if (!isSafeImageUrl(url)) return null;

  const image = <WidgetImg url={url} alt={alt} className={imgClassName} />;

  if (!preview) {
    return <div className={className}>{image}</div>;
  }

  const openPreview = () => {
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
        {image}
      </button>

      <SettingsDialogShell
        open={open}
        onOpenChange={setOpen}
        title="Image"
        width="xxl"
        icon={<ImageIcon className="size-3.5" />}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex max-h-[min(72dvh,760px)] items-center justify-center overflow-hidden rounded-lg bg-muted/40">
          <WidgetImg
            url={url}
            alt={alt}
            className="max-h-[min(72dvh,760px)] max-w-full h-auto w-auto object-contain"
          />
        </div>
      </SettingsDialogShell>
    </>
  );
}

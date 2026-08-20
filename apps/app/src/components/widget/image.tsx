"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon } from "@featul/ui/icons/image";
import { cn } from "@featul/ui/lib/utils";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { widgetImageInnerClass, widgetImageShellClass } from "./chrome";
import { isSafeImageUrl, postToParent, useParentOrigin } from "./messaging";

type Props = {
  url: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  preview?: boolean;
  onPreview?: () => void;
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
  imgClassName = "h-full w-full object-cover",
  preview = true,
  onPreview,
}: Props) {
  const parentOrigin = useParentOrigin();
  const [open, setOpen] = React.useState(false);

  if (!isSafeImageUrl(url)) return null;

  const image = <WidgetImg url={url} alt={alt} className={imgClassName} />;

  if (!preview) {
    return <div className={className}>{image}</div>;
  }

  const openPreview = () => {
    if (onPreview) {
      onPreview();
      return;
    }
    if (requestHostImagePreview(parentOrigin, url, alt)) return;
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className={cn(
          widgetImageShellClass,
          "cursor-pointer transition-opacity hover:opacity-90",
          className,
        )}
        aria-label="View full size image"
      >
        <div className={widgetImageInnerClass}>
          <div className="relative aspect-video h-full w-full min-h-[60px] bg-[rgb(var(--widget-surface))]">
            <WidgetImg
              url={url}
              alt={alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </button>

      {preview && !onPreview ? (
        <SettingsDialogShell
          open={open}
          onOpenChange={setOpen}
          title="Image"
          width="xxl"
          contentClassName="max-h-[92dvh]"
          icon={<ImageIcon className="size-3.5" />}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="flex max-h-[min(84dvh,1080px)] items-center justify-center overflow-hidden">
            <WidgetImg
              url={url}
              alt={alt}
              className="max-h-[min(84dvh,1080px)] max-w-full h-auto w-auto object-contain"
            />
          </div>
        </SettingsDialogShell>
      ) : null}
    </>
  );
}

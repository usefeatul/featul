"use client";

import { useEffect } from "react";
import { Button } from "@featul/ui/components/button";
import { ImageIcon } from "@featul/ui/icons/image";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";

export const imageLightboxContentClassName =
  "h-[min(88dvh,860px)] max-h-[92dvh] overflow-visible";

export const imageLightboxStageClassName =
  "flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-hidden";

export type LightboxImage = {
  url: string;
  alt: string;
};

/** Circular index wrap for lightbox prev/next. Empty lists stay at 0. */
function wrapIndex(index: number, length: number, delta: number) {
  if (length <= 0) return 0;
  return (index + delta + length) % length;
}

function LightboxNavButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <Toolbar size="sm" className="w-fit shrink-0">
      <Button
        type="button"
        variant="plain"
        size="icon-sm"
        className={toolbarItemClass}
        onClick={onClick}
        aria-label={direction === "prev" ? "Previous image" : "Next image"}
      >
        <ChevronLeftIcon
          size={14}
          className={direction === "next" ? "rotate-180" : undefined}
        />
      </Button>
    </Toolbar>
  );
}

export function ImageLightboxNav({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <div className="absolute top-1/2 right-[calc(100%+0.5rem)] z-20 -translate-y-1/2">
        <LightboxNavButton direction="prev" onClick={onPrev} />
      </div>
      <div className="absolute top-1/2 left-[calc(100%+0.5rem)] z-20 -translate-y-1/2">
        <LightboxNavButton direction="next" onClick={onNext} />
      </div>
    </>
  );
}

export function ImageLightboxView({
  images,
  index,
  onIndexChange,
  enabled = true,
}: {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  enabled?: boolean;
}) {
  const length = images.length;
  const safeIndex = length === 0 ? 0 : Math.min(Math.max(index, 0), length - 1);
  const current = images[safeIndex];
  const hasMany = length > 1;

  useEffect(() => {
    if (!enabled || !hasMany) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndexChange(wrapIndex(safeIndex, length, -1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndexChange(wrapIndex(safeIndex, length, 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, hasMany, length, onIndexChange, safeIndex]);

  if (!current) return null;

  return (
    <div className={imageLightboxStageClassName}>
      <img
        src={current.url}
        alt={current.alt}
        className="max-h-full max-w-full h-auto w-auto object-contain"
      />
    </div>
  );
}

export function ImageLightbox({
  open,
  onOpenChange,
  images,
  index,
  onIndexChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const length = images.length;
  const safeIndex = length === 0 ? 0 : Math.min(Math.max(index, 0), length - 1);
  const title =
    length > 1 ? `Image ${safeIndex + 1} of ${length}` : "Image";
  const hasMany = length > 1;

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      width="xxl"
      contentClassName={imageLightboxContentClassName}
      icon={<ImageIcon className="size-3.5" />}
      onOpenAutoFocus={(event) => event.preventDefault()}
      aside={
        hasMany ? (
          <ImageLightboxNav
            onPrev={() => onIndexChange(wrapIndex(safeIndex, length, -1))}
            onNext={() => onIndexChange(wrapIndex(safeIndex, length, 1))}
          />
        ) : null
      }
    >
      <ImageLightboxView
        images={images}
        index={safeIndex}
        onIndexChange={onIndexChange}
        enabled={open}
      />
    </SettingsDialogShell>
  );
}

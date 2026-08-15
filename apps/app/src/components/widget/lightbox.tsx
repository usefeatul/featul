"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@featul/ui/components/dialog";
import { ImageIcon } from "@featul/ui/icons/image";
import { WidgetImage } from "./image";
import { isSafeImageUrl } from "./messaging";

declare global {
  interface Window {
    __featulOpenHostImage?: (url: string, alt?: string) => void;
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
  const [url, setUrl] = React.useState("");
  const [alt, setAlt] = React.useState("");

  React.useEffect(() => {
    const openImage = (nextUrl: string, nextAlt = "") => {
      if (!isSafeImageUrl(nextUrl)) return;
      setUrl(nextUrl);
      setAlt(nextAlt);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        fluid
        overlayClassName="z-[2147483647] bg-black/20 backdrop-blur-xs dark:bg-black/20"
        className="z-2147483647 max-w-none gap-1 rounded-2xl bg-muted p-1 sm:max-w-none"
        style={{
          width: "min(92vw, 1070px)",
          maxWidth: "none",
          top: "50%",
          // Keep centered like SettingsDialogShell
          ["--tw-translate-y" as string]: "-50%",
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="mt-0.5 flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
            <ImageIcon className="size-3.5" />
            Image
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-xl border border-border bg-card p-2 dark:bg-black/60">
          <div className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/40">
            <WidgetImage url={url} alt={alt} imgClassName="h-full w-full object-contain" preview={false} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

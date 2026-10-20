"use client";

import React from "react";
import { ShareIcon } from "@/components/global/icons";
import { PopoverListItem } from "@featul/ui/components/popover";
import { toast } from "sonner";

/** Copy the post link to the clipboard. */
export async function copyPostLink(shareUrl?: string) {
  try {
    await navigator.clipboard.writeText(shareUrl || window.location.href);
    toast.success("Link copied to clipboard");
  } catch (err) {
    console.error("Failed to copy:", err);
    toast.error("Failed to copy link");
  }
}

/** Native share sheet when available, otherwise copy the link. */
export async function sharePostLink(shareUrl?: string, shareTitle?: string) {
  const url = shareUrl || window.location.href;
  const title = shareTitle || document.title;

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error("Could not share this link. Please try again.");
    }
  } else {
    await copyPostLink(url);
  }
}

export function RequestShareAction({
  url: shareUrl,
  title: shareTitle,
  className,
}: { url?: string; title?: string; className?: string } = {}) {
  const handleShare = () => sharePostLink(shareUrl, shareTitle);

  return (
    <PopoverListItem onClick={handleShare} className={className}>
      <ShareIcon className="size-4" />
      <span className="text-sm">Share</span>
    </PopoverListItem>
  );
}

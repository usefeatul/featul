"use client";

import React from "react";
import { ShareIcon } from "@featul/ui/icons/share";
import { PopoverListItem } from "@featul/ui/components/popover";
import { toast } from "sonner";



export function RequestShareAction({ url: shareUrl, title: shareTitle, className }: { url?: string; title?: string; className?: string } = {}) {
  const handleShare = async () => {
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
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <PopoverListItem onClick={handleShare} className={className}>
      <ShareIcon className="size-4" />
      <span className="text-sm">Share</span>
    </PopoverListItem>
  );
}

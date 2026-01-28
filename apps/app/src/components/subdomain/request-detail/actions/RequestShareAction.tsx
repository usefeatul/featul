"use client";

import React from "react";
import { ShareIcon } from "@featul/ui/icons/share";
import { PopoverListItem } from "@featul/ui/components/popover";
import { toast } from "sonner";



export function RequestShareAction() {
  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
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
    <PopoverListItem onClick={handleShare}>
      <span className="text-sm">Share</span>
      <ShareIcon className="ml-auto size-4 text-muted-foreground" />
    </PopoverListItem>
  );
}

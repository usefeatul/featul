"use client";

import React from "react";
import { Share2 } from "lucide-react";
import { PopoverListItem } from "@feedgot/ui/components/popover";

interface RequestShareActionProps {
  postId: string;
}

export function RequestShareAction({ postId }: RequestShareActionProps) {
  return (
    <PopoverListItem onClick={() => {}}>
      <span className="text-sm">Share</span>
      <Share2 className="ml-auto size-4 text-muted-foreground" />
    </PopoverListItem>
  );
}

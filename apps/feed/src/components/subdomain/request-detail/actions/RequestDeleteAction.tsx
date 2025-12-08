"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { PopoverListItem } from "@feedgot/ui/components/popover";

interface RequestDeleteActionProps {
  postId: string;
}

export function RequestDeleteAction({ postId }: RequestDeleteActionProps) {
  return (
    <PopoverListItem
      onClick={() => {}}
      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
    >
      <span className="text-sm">Delete</span>
      <Trash2 className="ml-auto size-4" />
    </PopoverListItem>
  );
}

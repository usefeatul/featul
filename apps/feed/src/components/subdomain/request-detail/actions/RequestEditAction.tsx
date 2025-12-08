"use client";

import React from "react";
import { Edit2 } from "lucide-react";
import { PopoverListItem } from "@feedgot/ui/components/popover";

interface RequestEditActionProps {
  postId: string;
}

export function RequestEditAction({ postId }: RequestEditActionProps) {
  return (
    <PopoverListItem onClick={() => {}}>
      <span className="text-sm">Edit</span>
      <Edit2 className="ml-auto size-4 text-muted-foreground" />
    </PopoverListItem>
  );
}

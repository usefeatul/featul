"use client";

import React from "react";
import { Flag } from "lucide-react";
import { PopoverListItem } from "@feedgot/ui/components/popover";

interface RequestReportActionProps {
  postId: string;
}

export function RequestReportAction({ postId }: RequestReportActionProps) {
  return (
    <PopoverListItem onClick={() => {}}>
      <span className="text-sm">Report</span>
      <Flag className="ml-auto size-4 text-muted-foreground" />
    </PopoverListItem>
  );
}

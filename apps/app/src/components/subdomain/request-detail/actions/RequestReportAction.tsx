"use client";

import React from "react";
import { FlagIcon } from "@featul/ui/icons/flag";
import { PopoverListItem } from "@featul/ui/components/popover";

interface RequestReportActionProps {
  onClick: () => void;
}

export function RequestReportAction({ onClick }: RequestReportActionProps) {
  return (
    <PopoverListItem onClick={onClick}>
      <span className="text-sm">Report</span>
      <FlagIcon className="ml-auto size-4 text-muted-foreground" />
    </PopoverListItem>
  );
}

"use client";

import React from "react";
import { EditIcon } from "@featul/ui/icons/edit";
import { PopoverListItem } from "@featul/ui/components/popover";

interface RequestEditActionProps {
  onClick: () => void;
}

export function RequestEditAction({ onClick }: RequestEditActionProps) {
  return (
    <PopoverListItem onClick={onClick}>
      <span className="text-sm">Edit</span>
      <EditIcon className="ml-auto size-4 text-muted-foreground" />
    </PopoverListItem>
  );
}

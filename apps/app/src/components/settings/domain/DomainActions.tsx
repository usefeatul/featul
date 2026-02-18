"use client";

import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { MoreVertical } from "lucide-react";
import { LoadingButton } from "@/components/global/loading-button";

export default function DomainActions({
  verifying,
  deleting,
  onVerify,
  onDelete,
  disabled,
}: {
  verifying: boolean;
  deleting?: boolean;
  onVerify: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <LoadingButton type="button" variant="nav" size="icon-sm" aria-label="More" disabled={disabled}>
          <MoreVertical className="size-4" />
        </LoadingButton>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          <PopoverListItem
            role="menuitem"
            onClick={() => {
              if (disabled) return;
              setOpen(false);
              onVerify();
            }}
            aria-disabled={verifying || Boolean(disabled)}
          >
            <span className="text-sm">Verify</span>
          </PopoverListItem>
          <PopoverListItem
            role="menuitem"
            onClick={() => {
              if (disabled) return;
              setOpen(false);
              onDelete();
            }}
            aria-disabled={Boolean(deleting) || Boolean(disabled)}
          >
            <span className="text-sm text-red-500">Delete</span>
          </PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}

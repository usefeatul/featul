"use client";

import React from "react";
import { Button } from "@feedgot/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@feedgot/ui/components/popover";
import { MoreVertical } from "lucide-react";

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
        <Button type="button" variant="ghost" size="icon-sm" aria-label="More" disabled={disabled}>
          <MoreVertical className="size-4" />
        </Button>
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

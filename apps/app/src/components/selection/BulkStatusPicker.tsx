"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { LayersIcon } from "@featul/ui/icons/layers";
import { DropdownIcon } from "@featul/ui/icons/dropdown";
import { cn } from "@featul/ui/lib/utils";
import { statusOptions } from "@/components/requests/RequestItemSubmenus";
import StatusIcon from "@/components/requests/StatusIcon";

type BulkStatusPickerProps = {
  disabled?: boolean;
  isPending?: boolean;
  onSelect: (status: string) => void;
};

export function BulkStatusPicker({
  disabled = false,
  isPending = false,
  onSelect,
}: BulkStatusPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-sm px-3",
            disabled && "pointer-events-none opacity-40",
          )}
          disabled={disabled || isPending}
          aria-label="Change status of selected posts"
        >
          <LayersIcon className="size-3.5" />
          <span>{isPending ? "Updating…" : "Status"}</span>
          <DropdownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {statusOptions.map((option) => (
            <PopoverListItem
              key={option.value}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSelect(option.value);
              }}
            >
              <StatusIcon status={option.value} className="size-4" />
              <span className="text-sm">{option.label}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}

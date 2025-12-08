"use client";

import React, { useState } from "react";
import { Button } from "@feedgot/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@feedgot/ui/components/popover";

const STATUSES = ["pending", "review", "planned", "progress", "completed", "closed"] as const;

interface StatusSelectorProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function StatusSelector({ status, onStatusChange }: StatusSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="nav"
          size="sm"
          className="h-8 gap-1 px-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <span className="capitalize">{status}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-1" align="start" list>
        <PopoverList>
          {STATUSES.map((s) => (
            <PopoverListItem
              key={s}
              role="menuitemradio"
              aria-checked={status === s}
              onClick={() => {
                onStatusChange(s);
                setOpen(false);
              }}
            >
              <span className="text-sm capitalize">{s.replace(/-/g, " ")}</span>
              {status === s ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}

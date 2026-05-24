"use client";

import React, { useState } from "react";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";

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
          variant="card"
          size="sm"
          className="h-8 gap-1 px-2 font-medium text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-black/30 dark:hover:bg-white/10"
        >
          <span className="capitalize">{status}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="start" list>
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

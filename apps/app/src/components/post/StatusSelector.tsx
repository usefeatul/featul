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
import { cn } from "@featul/ui/lib/utils";
import StatusIcon from "@/components/requests/StatusIcon";
import { normalizeRoadmapStatus } from "@/lib/roadmap";

const STATUSES = ["pending", "review", "planned", "progress", "completed", "closed"] as const;

interface StatusSelectorProps {
  status: string;
  onStatusChange: (status: string) => void;
}

export function StatusSelector({ status, onStatusChange }: StatusSelectorProps) {
  const [open, setOpen] = useState(false);
  const currentStatus = normalizeRoadmapStatus(status);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="plain"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-none border-0 bg-transparent px-2.5 text-xs font-medium text-foreground shadow-none before:hidden hover:bg-black/5 dark:bg-transparent dark:hover:bg-white/5",
            open && "bg-black/5 dark:bg-white/5",
          )}
        >
          <StatusIcon status={currentStatus} className="size-4" />
          <span className="capitalize">{currentStatus}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="start" list>
        <PopoverList>
          {STATUSES.map((s) => (
            <PopoverListItem
              key={s}
              role="menuitemradio"
              aria-checked={currentStatus === s}
              onClick={() => {
                onStatusChange(s);
                setOpen(false);
              }}
            >
              <StatusIcon status={s} className="size-4 shrink-0" />
              <span className="text-sm capitalize">{s.replace(/-/g, " ")}</span>
              {currentStatus === s ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}

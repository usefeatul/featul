"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import CircleQuestionMarkIcon from "@featul/ui/icons/circle-question-mark";
import { Button } from "@featul/ui/components/button";

const SHORTCUTS = [
  { keys: "[  ]", label: "Previous / next column" },
  { keys: "Shift + ← →", label: "Jump between columns" },
  { keys: "Shift + Home / End", label: "First / last column" },
  { keys: "Drag card", label: "Move cards between columns" },
  { keys: "Right-click card", label: "Quick actions menu" },
];

export default function RoadmapShortcutsHint({
  className = "",
}: {
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="icon-sm"
          aria-label="Roadmap keyboard shortcuts"
          className={className}
        >
          <CircleQuestionMarkIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <p className="mb-2 text-sm font-medium">Roadmap shortcuts</p>
        <ul className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.keys}
              className="flex items-start justify-between gap-3 text-xs"
            >
              <span className="text-accent">{shortcut.label}</span>
              <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

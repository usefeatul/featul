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

import type { BoardSummary } from "@/types/post";

interface BoardSelectorProps {
  boards: BoardSummary[];
  selectedBoard: BoardSummary | null;
  onSelectBoard: (board: BoardSummary) => void;
}

export function BoardSelector({
  boards,
  selectedBoard,
  onSelectBoard,
}: BoardSelectorProps) {
  const [open, setOpen] = useState(false);

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
          <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          {selectedBoard ? selectedBoard.name : "Select Board"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start" list>
        <PopoverList>
          {boards.map((b) => (
            <PopoverListItem
              key={b.id}
              onClick={() => {
                onSelectBoard(b);
                setOpen(false);
              }}
              className={cn(selectedBoard?.slug === b.slug && "bg-muted")}
            >
              <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span className="font-medium text-sm">{b.name}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}

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
import { toolbarItemClass } from "@featul/ui/components/toolbar";
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
          className={cn(toolbarItemClass, "px-3 font-medium text-foreground")}
        >
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
              <span className="font-medium text-sm">{b.name}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}

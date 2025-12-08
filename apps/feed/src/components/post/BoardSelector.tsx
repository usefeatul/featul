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
import { cn } from "@feedgot/ui/lib/utils";

interface BoardSelectorProps {
  boards: any[];
  selectedBoard: { name: string; slug: string } | null;
  onSelectBoard: (board: any) => void;
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
          variant="nav"
          size="sm"
          className="h-8 gap-1 px-2 font-medium text-foreground hover:bg-muted"
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

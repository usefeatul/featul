"use client";

import React, { useState } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feedgot/ui/components/avatar";
import { Button } from "@feedgot/ui/components/button";
import { XMarkIcon } from "@feedgot/ui/icons/xmark";
import { ChevronRight, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@feedgot/ui/components/popover";
import { cn } from "@feedgot/ui/lib/utils";

export interface PostHeaderProps {
  user: { name?: string; image?: string | null } | null;
  initials: string;
  boards: any[];
  selectedBoard: { name: string; slug: string } | null;
  onSelectBoard: (board: any) => void;
  onClose: () => void;
}

export function PostHeader({
  user,
  initials,
  boards,
  selectedBoard,
  onSelectBoard,
  onClose,
}: PostHeaderProps) {
  const [boardsOpen, setBoardsOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 p-3 md:p-4 pb-1">
      {/* User Avatar */}
      <Avatar className="size-8">
        {user?.image ? (
          <AvatarImage src={user.image} alt={user.name} />
        ) : (
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        )}
      </Avatar>

      <ChevronRight className="size-4 text-accent" />

      {/* Board Selector */}
      <Popover open={boardsOpen} onOpenChange={setBoardsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="nav"
            size="sm"
            className="h-8 gap-1 px-2 font-medium text-foreground hover:bg-muted"
          >
            {selectedBoard ? selectedBoard.name : "Select Board"}
            <ChevronsUpDown className="size-3.5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="start" list>
          <PopoverList>
            {boards.map((b) => (
              <PopoverListItem
                key={b.id}
                onClick={() => {
                  onSelectBoard(b);
                  setBoardsOpen(false);
                }}
                className={cn(selectedBoard?.slug === b.slug && "bg-muted")}
              >
                <span className="font-medium text-sm">{b.name}</span>
              </PopoverListItem>
            ))}
          </PopoverList>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="ml-auto h-6 w-6 rounded-sm text-muted-foreground hover:text-foreground"
        onClick={onClose}
      >
        <XMarkIcon size={12} />
      </Button>
    </div>
  );
}

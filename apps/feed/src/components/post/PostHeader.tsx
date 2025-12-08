"use client";

import React, { useState } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@feedgot/ui/components/avatar";
import { Button } from "@feedgot/ui/components/button";
import { XMarkIcon } from "@feedgot/ui/icons/xmark";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@feedgot/ui/components/popover";
import { cn } from "@feedgot/ui/lib/utils";
import { TagIcon } from "@feedgot/ui/icons/tag";

const STATUSES = ["pending", "review", "planned", "progress", "completed", "closed"] as const;

export interface PostHeaderProps {
  user: { name?: string; image?: string | null } | null;
  initials: string;
  boards: any[];
  selectedBoard: { name: string; slug: string } | null;
  onSelectBoard: (board: any) => void;
  onClose: () => void;
  // Status props
  status?: string;
  onStatusChange?: (status: string) => void;
  // Tags props
  availableTags?: any[];
  selectedTags?: string[];
  onToggleTag?: (tagId: string) => void;
}

export function PostHeader({
  user,
  initials,
  boards,
  selectedBoard,
  onSelectBoard,
  onClose,
  status,
  onStatusChange,
  availableTags,
  selectedTags,
  onToggleTag,
}: PostHeaderProps) {
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

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

      {/* Board Selector */}
      <Popover open={boardsOpen} onOpenChange={setBoardsOpen}>
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

      {status && onStatusChange && (
        <>
          {/* Status Picker */}
          <Popover open={statusOpen} onOpenChange={setStatusOpen}>
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
                      setStatusOpen(false);
                    }}
                  >
                    <span className="text-sm capitalize">{s.replace(/-/g, " ")}</span>
                    {status === s ? <span className="ml-auto text-xs">✓</span> : null}
                  </PopoverListItem>
                ))}
              </PopoverList>
            </PopoverContent>
          </Popover>
        </>
      )}

      {availableTags && selectedTags && onToggleTag && (
        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="nav"
              size="sm"
              className="h-8 gap-1 px-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <TagIcon className="size-3.5 opacity-70" />
              {selectedTags.length > 0 && (
                <span className="text-xs">{selectedTags.length}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit p-1" align="start" list>
            {availableTags.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground">No tags available</div>
            ) : (
              <PopoverList>
                {availableTags.map((tag) => (
                  <PopoverListItem
                    key={tag.id}
                    role="menuitemcheckbox"
                    aria-checked={selectedTags.includes(tag.id)}
                    onClick={() => onToggleTag(tag.id)}
                  >
                    <span className="text-sm truncate max-w-[140px]">{tag.name}</span>
                    {selectedTags.includes(tag.id) ? (
                      <span className="ml-auto text-xs">✓</span>
                    ) : null}
                  </PopoverListItem>
                ))}
              </PopoverList>
            )}
          </PopoverContent>
        </Popover>
      )}

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

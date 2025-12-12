"use client";

import React from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@oreilla/ui/components/avatar";
import { Button } from "@oreilla/ui/components/button";
import { XMarkIcon } from "@oreilla/ui/icons/xmark";
import { ChevronRightIcon } from "@oreilla/ui/icons/chevron-right";
import { BoardSelector } from "./BoardSelector";
import { StatusSelector } from "./StatusSelector";
import { TagSelector } from "./TagSelector";

export interface PostHeaderProps {
  user: { name?: string; image?: string | null } | null;
  initials: string;
  boards: any[];
  selectedBoard: { name: string; slug: string } | null;
  onSelectBoard: (board: any) => void;
  onClose: () => void;
  status?: string;
  onStatusChange?: (status: string) => void;
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
      <ChevronRightIcon className="size-3" />
      <BoardSelector
        boards={boards}
        selectedBoard={selectedBoard}
        onSelectBoard={onSelectBoard}
      />
      {status && onStatusChange && (
        <StatusSelector status={status} onStatusChange={onStatusChange} />
      )}
      {availableTags && selectedTags && onToggleTag && (
        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={onToggleTag}
        />
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

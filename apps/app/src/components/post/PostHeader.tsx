"use client";

import React from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { BoardSelector } from "./BoardSelector";
import { StatusSelector } from "./StatusSelector";
import { TagSelector } from "./TagSelector";
import type { BoardSummary, TagSummary, PostUser } from "@/types/post";

export interface PostHeaderProps {
  user: PostUser | null;
  initials: string;
  boards: BoardSummary[];
  selectedBoard: BoardSummary | null;
  onSelectBoard: (board: BoardSummary) => void;
  status?: string;
  onStatusChange?: (status: string) => void;
  availableTags?: TagSummary[];
  selectedTags?: string[];
  onToggleTag?: (tagId: string) => void;
}

export function PostHeader({
  user,
  initials,
  boards,
  selectedBoard,
  onSelectBoard,
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
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
    </div>
  );
}

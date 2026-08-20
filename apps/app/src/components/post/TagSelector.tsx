"use client";

import React, { useState } from "react";
import { Button } from "@featul/ui/components/button";
import { TagIcon } from "@featul/ui/icons/tag";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";

import type { TagSummary } from "@/types/post";

interface TagSelectorProps {
  availableTags: TagSummary[];
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
}

export function TagSelector({
  availableTags,
  selectedTags,
  onToggleTag,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="plain"
          size="sm"
          className={cn(toolbarItemClass, "px-2.5 font-medium text-muted-foreground hover:text-foreground")}
        >
          <TagIcon className="size-3.5 opacity-70" />
          {selectedTags.length > 0 && (
            <span className="text-xs">{selectedTags.length}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit" align="start" list>
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
  );
}

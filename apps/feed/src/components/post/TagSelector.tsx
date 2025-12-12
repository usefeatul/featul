"use client";

import React, { useState } from "react";
import { Button } from "@oreilla/ui/components/button";
import { TagIcon } from "@oreilla/ui/icons/tag";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@oreilla/ui/components/popover";

interface TagSelectorProps {
  availableTags: any[];
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

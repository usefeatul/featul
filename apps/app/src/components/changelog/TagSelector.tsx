"use client";

import { useState } from "react";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { cn } from "@featul/ui/lib/utils";
import { TagDot } from "@/components/global/tag";
import { Check, TagIcon, XMarkIcon } from "@/components/global/icons";
import type { WorkspaceTag } from "@/types/changelog";

const controlClass =
  "h-7 rounded-lg border-0 bg-black/5 px-2 text-xs text-muted-foreground shadow-none ring-0 before:hidden hover:bg-black/[0.08] hover:text-foreground dark:bg-secondary dark:hover:bg-muted";

interface TagSelectorProps {
  availableTags: WorkspaceTag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

/** The entry's tags shown above the title: click a tag to remove it, or pick more from the list. */
export function TagSelector({ availableTags, selectedTags, onTagsChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleTag = (tagId: string) =>
    onTagsChange(
      selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId],
    );

  const selected = availableTags.filter((tag) => selectedTags.includes(tag.id));

  return (
    <>
      {selected.map((tag) => (
        <Button
          key={tag.id}
          type="button"
          variant="plain"
          size="sm"
          className={cn(controlClass, "gap-1.5")}
          onClick={() => toggleTag(tag.id)}
          aria-label={`Remove tag ${tag.name}`}
        >
          <TagDot />
          {tag.name}
          <XMarkIcon className="size-3 text-muted-foreground" />
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="plain"
            size="sm"
            className={cn(controlClass, "gap-1.5")}
            aria-label={selected.length ? "Edit tags" : "Add tags"}
          >
            <TagIcon className="size-3.5" />
            {selected.length ? null : "Tags"}
          </Button>
        </PopoverTrigger>
        <PopoverContent list align="start" className="w-fit min-w-0">
          {availableTags.length === 0 ? (
            <div className="p-2 text-xs text-muted-foreground">
              No tags yet. Add them in changelog settings.
            </div>
          ) : (
            <PopoverList>
              {availableTags.map((tag) => {
                const checked = selectedTags.includes(tag.id);
                return (
                  <PopoverListItem
                    key={tag.id}
                    role="menuitemcheckbox"
                    aria-checked={checked}
                    onClick={() => toggleTag(tag.id)}
                  >
                    <TagDot />
                    <span className="max-w-40 min-w-24 truncate text-sm">{tag.name}</span>
                    <Check
                      className={cn("ml-auto size-3.5 shrink-0 text-primary", !checked && "invisible")}
                      aria-hidden="true"
                    />
                  </PopoverListItem>
                );
              })}
            </PopoverList>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}

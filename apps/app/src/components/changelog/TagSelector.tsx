"use client";

import { useState } from "react";
import { Button } from "@featul/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { TagIcon } from "@featul/ui/icons/tag";
import XMarkIcon from "@featul/ui/icons/xmark";
import { ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";

export interface WorkspaceTag {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
}

interface TagSelectorProps {
    availableTags: WorkspaceTag[];
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
}

export function TagSelector({
    availableTags,
    selectedTags,
    onTagsChange,
}: TagSelectorProps) {
    const [open, setOpen] = useState(false);

    const toggleTag = (tagId: string) => {
        onTagsChange(
            selectedTags.includes(tagId)
                ? selectedTags.filter((id) => id !== tagId)
                : [...selectedTags, tagId]
        );
    };

    const selectedTagObjects = availableTags.filter((t) => selectedTags.includes(t.id));

    return (
        <>
            {selectedTags.length === 0 ? (
                <span className={cn(toolbarItemClass, "px-3 text-xs text-muted-foreground")}>
                    No tags
                </span>
            ) : (
                selectedTagObjects.map((tag, index) => (
                    <span key={tag.id} className="contents">
                        {index > 0 ? <ToolbarSeparator /> : null}
                        <Button
                            type="button"
                            variant="plain"
                            size="sm"
                            className={cn(toolbarItemClass, "gap-1.5 px-3 text-xs")}
                            onClick={() => toggleTag(tag.id)}
                        >
                            {tag.name}
                            <XMarkIcon className="size-3 text-muted-foreground" />
                        </Button>
                    </span>
                ))
            )}
            <ToolbarSeparator />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="plain"
                        size="icon"
                        className={cn(toolbarItemClass, "px-3")}
                        aria-label="Add tag"
                    >
                        <TagIcon size={16} className="text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent list align="center" className="min-w-0 w-fit">
                    <PopoverList>
                        {availableTags.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                No tags available
                            </div>
                        ) : (
                            availableTags.map((tag) => (
                                <PopoverListItem
                                    key={tag.id}
                                    role="menuitemcheckbox"
                                    aria-checked={selectedTags.includes(tag.id)}
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    <span className="text-sm">{tag.name}</span>
                                    {selectedTags.includes(tag.id) && <span className="ml-auto text-xs">✓</span>}
                                </PopoverListItem>
                            ))
                        )}
                    </PopoverList>
                </PopoverContent>
            </Popover>
        </>
    );
}

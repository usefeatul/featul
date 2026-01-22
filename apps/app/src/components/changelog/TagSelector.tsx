"use client";

import { useState } from "react";
import { Button } from "@featul/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { TagIcon } from "@featul/ui/icons/tag";
import { X } from "lucide-react";

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
            {/* Empty State */}
            {selectedTags.length === 0 && (
                <div className="h-7 px-2.5 text-xs border border-border bg-card text-muted-foreground rounded-md flex items-center shadow-none select-none">
                    No tags
                </div>
            )}

            {/* Selected Tags */}
            {selectedTagObjects.map((tag) => (
                <Button
                    key={tag.id}
                    variant="card"
                    size="sm"
                    className="h-7 text-xs px-2.5 shadow-none gap-1.5"
                    onClick={() => toggleTag(tag.id)}
                >
                    {tag.name}
                    <X className="h-3 w-3 text-muted-foreground" />
                </Button>
            ))}

            {/* Add Tag Button */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="card" size="icon" className="h-7 w-7">
                        <TagIcon size={16} className="text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent list align="start" className="min-w-0 w-fit">
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

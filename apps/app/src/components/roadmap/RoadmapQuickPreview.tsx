"use client";

import React from "react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { Button } from "@featul/ui/components/button";
import { UpvoteButton } from "@/components/upvote/UpvoteButton";
import FillCommentIcon from "@featul/ui/icons/fill-comment";
import { Eye } from "lucide-react";
import type { RoadmapItemData } from "@/components/roadmap/RoadmapRequestItem";
import { buildRoadmapPreview } from "@/components/roadmap/card";

export default function RoadmapQuickPreview({
  item,
  workspaceSlug,
}: {
  item: RoadmapItemData;
  workspaceSlug: string;
}) {
  const [open, setOpen] = React.useState(false);
  const href = `/workspaces/${workspaceSlug}/requests/${item.slug}`;
  const preview = buildRoadmapPreview(item.content, item.boardName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="plain"
          size="icon-sm"
          className="absolute right-2 top-2 z-10 size-6 text-accent/60 opacity-0 transition-opacity hover:text-foreground group-hover/card:opacity-100"
          aria-label="Quick preview"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <Eye className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium leading-5">{item.title}</p>
            <p className="mt-2 text-xs leading-5 text-accent">{preview}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-accent">
            <UpvoteButton
              postId={item.id}
              upvotes={item.upvotes}
              hasVoted={item.hasVoted}
            />
            <span className="inline-flex items-center gap-1">
              <FillCommentIcon className="size-3.5" size={14} />
              {item.commentCount}
            </span>
            <span>{item.boardName}</span>
          </div>
          {(item.tags || []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(item.tags || []).slice(0, 4).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-sm bg-muted px-2 py-0.5 text-[10px] text-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
          <Button asChild size="sm" className="h-8 w-full">
            <Link href={href} onClick={() => setOpen(false)}>
              Open request
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

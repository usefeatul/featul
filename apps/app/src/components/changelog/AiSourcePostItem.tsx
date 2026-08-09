"use client";

import React from "react";
import StatusIcon from "@/components/requests/StatusIcon";
import { SelectionControl } from "@/components/selection/SelectionControl";
import { getSelectableRowClassName } from "@/components/selection/Row";
import { VoteCount } from "@/components/upvote/VoteCount";
import { VoteIcon } from "@/components/upvote/VoteIcon";

export type AiSourcePost = {
  id: string;
  title: string;
  content: string;
  upvotes: number;
  roadmapStatus: string | null;
  updatedAt: string | Date | null;
};

interface AiSourcePostItemProps {
  post: AiSourcePost;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
}

function AiSourcePostItemBase({ post, isSelected, onToggle }: AiSourcePostItemProps) {
  const displayTitle =
    post.title.length > 110 ? `${post.title.slice(0, 110).trimEnd()}…` : post.title;

  const handleRowClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      onToggle(!isSelected);
    },
    [isSelected, onToggle],
  );

  const rowClassName = getSelectableRowClassName(
    true,
    isSelected,
    "flex w-full items-start gap-3 px-5 py-3 bg-card dark:bg-black/40 relative overflow-hidden",
  );

  const contentPreview = post.content?.trim();

  const updatedLabel = post.updatedAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(
        new Date(post.updatedAt),
      )
    : null;

  return (
    <li className="m-0 list-none border-b border-border/70 p-0 last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        className={rowClassName}
        onClick={handleRowClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle(!isSelected);
          }
        }}
      >
        <div className="flex h-5 shrink-0 items-center">
          <SelectionControl
            checked={isSelected}
            label={isSelected ? `Deselect ${post.title}` : `Select ${post.title}`}
            onCheckedChange={(value) => onToggle(value === true)}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
        <StatusIcon
          status={post.roadmapStatus || undefined}
          className="size-5 shrink-0 text-foreground/80"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-h-5 items-center gap-3">
            <p className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-foreground">
              {displayTitle}
            </p>
            <div className="flex shrink-0 items-center gap-3 text-xs text-accent pointer-events-none">
              <div className="inline-flex items-center gap-1.5 text-muted-foreground/70">
                <VoteIcon hasVoted={false} />
                <VoteCount upvotes={post.upvotes} />
              </div>
              {updatedLabel ? (
                <span className="text-muted-foreground">{updatedLabel}</span>
              ) : null}
            </div>
          </div>
          {contentPreview ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {contentPreview}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export const AiSourcePostItem = React.memo(AiSourcePostItemBase);

export default AiSourcePostItem;

"use client";

import type { MouseEvent } from "react";
import { PopoverList, PopoverListItem } from "@featul/ui/components/popover";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { GitHubIcon } from "@featul/ui/icons/github";
import { cn } from "@featul/ui/lib/utils";
import StatusIcon from "@/components/requests/StatusIcon";
import type { AiSourcePost } from "../AiSourcePostItem";

export type SourceItem =
  | { kind: "week" }
  | { kind: "post"; post: AiSourcePost };

function SourceGroup({
  label,
  posts,
  items,
  selectedIndex,
  onSelect,
  onHighlight,
}: {
  label: string;
  posts: AiSourcePost[];
  items: SourceItem[];
  selectedIndex: number;
  onSelect: (post: AiSourcePost) => void;
  onHighlight: (index: number) => void;
}) {
  if (posts.length === 0) return null;

  return (
    <>
      <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {posts.map((post) => {
        const index = items.findIndex(
          (item) => item.kind === "post" && item.post.id === post.id,
        );
        return (
          <PopoverListItem
            key={post.id}
            type="button"
            onMouseDown={(event: MouseEvent<HTMLButtonElement>) =>
              event.preventDefault()
            }
            onClick={() => onSelect(post)}
            onMouseEnter={() => onHighlight(index)}
            className={cn(
              "w-full gap-2 whitespace-normal text-sm",
              index === selectedIndex && "bg-muted/40",
            )}
          >
            <StatusIcon
              status={post.roadmapStatus || undefined}
              className="size-4 shrink-0"
            />
            <span className="min-w-0 flex-1 truncate">{post.title}</span>
            {post.githubUrl ? (
              <GitHubIcon className="size-3.5 shrink-0 text-muted-foreground" />
            ) : null}
          </PopoverListItem>
        );
      })}
    </>
  );
}

export function Sources({
  query,
  isLoading,
  items,
  selectedIndex,
  completedThisWeekCount,
  completedPosts,
  progressPosts,
  onSelectWeek,
  onSelectPost,
  onHighlight,
}: {
  query: string;
  isLoading: boolean;
  items: SourceItem[];
  selectedIndex: number;
  completedThisWeekCount: number;
  completedPosts: AiSourcePost[];
  progressPosts: AiSourcePost[];
  onSelectWeek: () => void;
  onSelectPost: (post: AiSourcePost) => void;
  onHighlight: (index: number) => void;
}) {
  return (
    <div className="mb-2 overflow-hidden rounded-xl bg-background ring-1 ring-border/70 dark:bg-[#202020]">
      <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Attach feedback
      </p>
      {isLoading ? (
        <div className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
          <LoaderIcon className="size-3.5 animate-spin" />
          Loading posts…
        </div>
      ) : items.length === 0 ? (
        <p className="px-3 py-6 text-xs text-muted-foreground">
          No posts match “{query}”.
        </p>
      ) : (
        <PopoverList className="flex max-h-56 w-full flex-col overflow-y-auto scrollbar-hide">
          {items[0]?.kind === "week" ? (
            <PopoverListItem
              type="button"
              onMouseDown={(event: MouseEvent<HTMLButtonElement>) =>
                event.preventDefault()
              }
              onClick={onSelectWeek}
              onMouseEnter={() => onHighlight(0)}
              className={cn(
                "w-full text-sm font-medium text-primary",
                selectedIndex === 0 && "bg-muted/40",
              )}
            >
              All completed this week ({completedThisWeekCount})
            </PopoverListItem>
          ) : null}
          <SourceGroup
            label="Completed"
            posts={completedPosts}
            items={items}
            selectedIndex={selectedIndex}
            onSelect={onSelectPost}
            onHighlight={onHighlight}
          />
          <SourceGroup
            label="In progress"
            posts={progressPosts}
            items={items}
            selectedIndex={selectedIndex}
            onSelect={onSelectPost}
            onHighlight={onHighlight}
          />
        </PopoverList>
      )}
    </div>
  );
}

export function Attachments({
  posts,
  onRemove,
}: {
  posts: AiSourcePost[];
  onRemove: (id: string) => void;
}) {
  if (posts.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-1">
      {posts.map((post) => (
        <button
          key={post.id}
          type="button"
          onClick={() => onRemove(post.id)}
          className="inline-flex max-w-full cursor-pointer items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/15"
        >
          <StatusIcon
            status={post.roadmapStatus || undefined}
            className="size-3 shrink-0"
          />
          <span className="truncate">@{post.title}</span>
          <XMarkIcon className="size-2.5 shrink-0" />
        </button>
      ))}
    </div>
  );
}

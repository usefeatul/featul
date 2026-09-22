"use client";

import type { MouseEvent } from "react";
import { CalendarCheck2 } from "lucide-react";
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
      <p className="sticky top-0 z-10 border-y border-border/40 bg-background/95 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur-sm dark:border-sidebar-border dark:bg-sidebar/95">
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
              "min-h-10 w-full gap-2 whitespace-normal px-3 py-2.5 text-[13px] font-medium",
              index === selectedIndex && "bg-muted/65 dark:bg-white/[0.055]",
            )}
          >
            <StatusIcon
              status={post.roadmapStatus || undefined}
              className="size-3.5 shrink-0 text-foreground/70"
            />
            <span className="min-w-0 flex-1 truncate text-foreground/90">
              {post.title}
            </span>
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
    <div
      id="changelog-feedback-picker"
      className="absolute inset-x-3 bottom-[calc(100%-0.75rem)] z-20 overflow-hidden rounded-xl bg-card shadow-xl ring-1 ring-border/70 dark:ring-white/10"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-muted-foreground">
          <LoaderIcon className="size-3.5 animate-spin" />
          Loading posts…
        </div>
      ) : items.length === 0 ? (
        <p className="px-3 py-6 text-xs text-muted-foreground">
          No posts match “{query}”.
        </p>
      ) : (
        <PopoverList className="scrollbar-hide flex max-h-64 w-full flex-col overflow-y-auto overscroll-contain">
          {items[0]?.kind === "week" ? (
            <PopoverListItem
              type="button"
              onMouseDown={(event: MouseEvent<HTMLButtonElement>) =>
                event.preventDefault()
              }
              onClick={onSelectWeek}
              onMouseEnter={() => onHighlight(0)}
              className={cn(
                "min-h-10 w-full gap-2 px-3 py-2.5 text-[13px] font-medium text-foreground/90",
                selectedIndex === 0 &&
                  "bg-muted/65 dark:bg-white/[0.055]",
              )}
            >
              <CalendarCheck2 className="size-3.5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate">
                All completed this week
              </span>
              <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-muted px-2 text-[10px] font-medium tabular-nums text-muted-foreground dark:bg-[#2a2a2a]">
                {completedThisWeekCount}
              </span>
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
          className="inline-flex max-w-full cursor-pointer items-center gap-1 rounded-md bg-muted/70 px-2 py-1 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground dark:bg-[#242424] dark:hover:bg-[#2a2a2a]"
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

"use client";

import { cn } from "@featul/ui/lib/utils";
import { SearchIcon } from "@featul/ui/icons/search";
import { LayersIcon } from "@featul/ui/icons/layers";
import { TagIcon } from "@featul/ui/icons/tag";
import { ArrowUpDownIcon } from "@featul/ui/icons/arrow-up-down";
import { LoveIcon } from "@featul/ui/icons/love";
import { CommentsIcon } from "@featul/ui/icons/comments";
import {
  DEMO_POSTS,
  DEMO_STATUS_LABELS,
  type DemoStatus,
} from "./data";
import { DemoStatusIcon } from "./demo-status-icon";
import { DemoAvatar } from "./demo-avatar";

function Toolbar() {
  const items = [
    { label: "Search", icon: <SearchIcon className="size-3.5" /> },
    { label: "Boards", icon: <LayersIcon className="size-3.5" /> },
    { label: "Tags", icon: <TagIcon className="size-3.5" /> },
    { label: "Sort", icon: <ArrowUpDownIcon className="size-3.5" /> },
  ];
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-border/70 bg-card shadow-xs">
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          aria-label={item.label}
          className={cn(
            "flex h-7 w-8 cursor-default items-center justify-center text-accent transition-colors hover:bg-muted hover:text-foreground",
            index > 0 && "border-l border-border/60"
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}

export function DemoRequests({
  statusFilter,
  votes,
  onToggleVote,
  onClearFilter,
}: {
  statusFilter: DemoStatus | null;
  votes: Record<string, boolean>;
  onToggleVote: (id: string) => void;
  onClearFilter: () => void;
}) {
  const posts = statusFilter
    ? DEMO_POSTS.filter((post) => post.status === statusFilter)
    : DEMO_POSTS;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">Requests</h3>
          {statusFilter ? (
            <button
              type="button"
              onClick={onClearFilter}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border/70 bg-card px-2 py-0.5 text-[10px] text-accent transition-colors hover:text-foreground"
            >
              {DEMO_STATUS_LABELS[statusFilter]}
              <span aria-hidden>×</span>
            </button>
          ) : null}
        </div>
        <Toolbar />
      </div>

      <div className="mx-4 mb-4 flex flex-1 flex-col overflow-hidden rounded-md border border-border/70 bg-card ring-1 ring-border/40">
        {posts.map((post) => {
          const hasVoted = Boolean(votes[post.id]);
          const upvotes = post.upvotes + (hasVoted ? 1 : 0);
          return (
            <div
              key={post.id}
              className="flex min-h-0 max-h-16 flex-1 items-center gap-3 border-b border-border/60 px-3 py-3 transition-colors last:border-b-0 hover:bg-background/70"
            >
              <DemoStatusIcon status={post.status} className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                {post.title}
              </span>
              <div className="flex shrink-0 items-center gap-3 text-[11px] text-accent">
                <button
                  type="button"
                  onClick={() => onToggleVote(post.id)}
                  aria-pressed={hasVoted}
                  aria-label={`Upvote ${post.title}`}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 transition-all active:scale-90",
                    hasVoted ? "text-red-500" : "hover:text-red-500/80"
                  )}
                >
                  <LoveIcon
                    width={12}
                    height={12}
                    className={cn(
                      "transition-transform",
                      hasVoted && "scale-110"
                    )}
                  />
                  <span className="tabular-nums">{upvotes}</span>
                </button>
                <span className="inline-flex items-center gap-1">
                  <CommentsIcon size={12} />
                  <span className="tabular-nums">{post.comments}</span>
                </span>
                <span className="hidden sm:inline">{post.date}</span>
                <DemoAvatar name={post.author} className="size-5 text-[8px]" />
              </div>
            </div>
          );
        })}
        {posts.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-accent">
            No requests with this status yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

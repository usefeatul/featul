"use client";

import { cn } from "@featul/ui/lib/utils";
import { SearchIcon } from "@featul/ui/icons/search";
import { LayersIcon } from "@featul/ui/icons/layers";
import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { TagIcon } from "@featul/ui/icons/tag";
import { ArrowUpDownIcon } from "@featul/ui/icons/arrow-up-down";
import { LoveIcon } from "@featul/ui/icons/love";
import { CommentsIcon } from "@featul/ui/icons/comments";
import { StarIcon } from "@featul/ui/icons/star";
import { PinIcon } from "@featul/ui/icons/pin";
import { StarPinIcon } from "@featul/ui/icons/star-pin";
import {
  DEMO_POSTS,
  DEMO_STATUS_LABELS,
  type DemoPost,
  type DemoStatus,
} from "./data";
import { DemoStatusIcon } from "./icon";
import { DemoAvatar } from "./avatar";

function Toolbar() {
  const items = [
    { label: "Search", icon: <SearchIcon className="size-3.5" /> },
    { label: "Boards", icon: <LayersIcon className="size-3.5" /> },
    { label: "Status", icon: <ListFilterIcon size={14} /> },
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

function DemoFlagRibbon({
  isPinned,
  isFeatured,
}: {
  isPinned?: boolean;
  isFeatured?: boolean;
}) {
  if (!isPinned && !isFeatured) return null;

  const Icon =
    isPinned && isFeatured ? StarPinIcon : isPinned ? PinIcon : StarIcon;
  const surface = cn(
    "absolute inset-0 rounded-[1px] border border-border/80 ring-1 ring-border/60 ring-offset-1 ring-offset-white",
    isPinned && isFeatured && "bg-linear-to-r from-primary to-amber-500",
    isPinned && !isFeatured && "bg-primary",
    !isPinned && isFeatured && "bg-amber-500"
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-[19px] -top-[19px] flex h-[38px] w-[38px] rotate-45 items-end justify-center pb-1"
    >
      <div className={surface} />
      <div className="relative z-10 mb-px text-white">
        <Icon width={10} height={10} className="fill-current" />
      </div>
    </div>
  );
}

function RequestRow({
  post,
  hasVoted,
  upvotes,
  onToggleVote,
}: {
  post: DemoPost;
  hasVoted: boolean;
  upvotes: number;
  onToggleVote: () => void;
}) {
  return (
    <div className="relative flex cursor-pointer items-center gap-3 overflow-hidden border-b border-border/70 bg-card px-3 py-3 last:border-b-0 hover:bg-background/70 sm:px-4">
      <DemoFlagRibbon isPinned={post.isPinned} isFeatured={post.isFeatured} />
      <DemoStatusIcon
        status={post.status}
        className="size-5 shrink-0 text-foreground/80"
      />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
        {post.title}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-3 text-[11px] text-accent">
        <button
          type="button"
          onClick={onToggleVote}
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
            className={cn("transition-transform", hasVoted && "scale-110")}
          />
          <span className="tabular-nums">{upvotes}</span>
        </button>
        <span className="inline-flex items-center gap-1">
          <CommentsIcon aria-hidden className="size-3.5" />
          <span className="tabular-nums">{post.comments}</span>
        </span>
        <span className="hidden w-12 text-right sm:inline">{post.date}</span>
        <DemoAvatar
          name={post.author}
          className="size-6 text-[8px]"
          role={post.role}
          isOwner={post.isOwner}
        />
      </div>
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
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold text-foreground">Requests</h3>
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

      <div className="mx-4 mb-4 min-h-0 flex-1 overflow-y-auto rounded-sm border border-border bg-card ring-1 ring-border/60 ring-offset-1 ring-offset-white">
        {posts.map((post) => {
          const hasVoted = Boolean(votes[post.id]);
          const voteDelta =
            Number(hasVoted) - Number(Boolean(post.hasVoted));
          const upvotes = post.upvotes + voteDelta;
          return (
            <RequestRow
              key={post.id}
              post={post}
              hasVoted={hasVoted}
              upvotes={upvotes}
              onToggleVote={() => onToggleVote(post.id)}
            />
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

"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { CommentsIcon } from "@featul/ui/icons/comments";
import RoleBadge from "@/components/global/RoleBadge";
import { UpvoteButton } from "@/components/upvote/UpvoteButton";
import { getInitials } from "@/utils/user";

export default function RoadmapRequestItemFooter({
  authorLabel,
  avatarSrc,
  boardLabel,
  dateLabel,
  commentCount,
  postId,
  upvotes,
  hasVoted,
  role,
  isOwner,
  isFeatul,
}: {
  authorLabel: string;
  avatarSrc: string;
  boardLabel: string;
  dateLabel: string;
  commentCount: number;
  postId: string;
  upvotes: number;
  hasVoted?: boolean;
  role?: "admin" | "member" | "viewer" | null;
  isOwner?: boolean;
  isFeatul?: boolean;
}) {
  return (
    <div className="mt-auto flex shrink-0 items-center gap-2 px-2.5 pb-2 pt-1">
      <Avatar className="relative size-5 shrink-0 overflow-visible bg-muted">
        <AvatarImage src={avatarSrc} alt={authorLabel} />
        <AvatarFallback className="text-[10px] font-medium">
          {getInitials(authorLabel)}
        </AvatarFallback>
        <RoleBadge
          role={role}
          isOwner={isOwner}
          isFeatul={isFeatul}
          className="-bottom-1! -right-1! bg-background dark:bg-background"
        />
      </Avatar>
      <div
        className="ml-auto flex min-w-0 items-center gap-1.5 text-[10px] leading-none text-muted-foreground"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <span
          className="inline-flex h-5 min-w-0 max-w-20 items-center gap-1.5 rounded-md bg-background/60 px-1.5 dark:bg-black/20"
          title={boardLabel}
        >
          <span
            className="size-1.5 shrink-0 rounded-full bg-primary"
            aria-hidden
          />
          <span className="truncate whitespace-nowrap">{boardLabel}</span>
        </span>
        <span
          className="inline-flex h-5 shrink-0 items-center gap-1 rounded-md bg-background/60 px-1.5 dark:bg-black/20"
          title={`${commentCount} comments`}
        >
          <CommentsIcon className="size-3" aria-hidden />
          <span className="tabular-nums">{commentCount}</span>
        </span>
        <UpvoteButton
          postId={postId}
          upvotes={upvotes}
          hasVoted={hasVoted}
          className="h-5 gap-1 rounded-md bg-background/60 px-1.5 text-[10px] hover:bg-background/80 dark:bg-black/20 dark:hover:bg-black/30"
        />
        <span className="shrink-0 whitespace-nowrap text-muted-foreground/80">
          {dateLabel}
        </span>
      </div>
    </div>
  );
}

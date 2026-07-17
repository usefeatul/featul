"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import CalendarIcon from "@featul/ui/icons/calendar";
import FillCommentIcon from "@featul/ui/icons/fill-comment";
import TagIcon from "@featul/ui/icons/tag";
import RoleBadge from "@/components/global/RoleBadge";
import { getInitials } from "@/utils/user";

export default function RoadmapRequestItemFooter({
  toneFooterClass,
  authorLabel,
  avatarSrc,
  boardLabel,
  dateLabel,
  commentCount,
  role,
  isOwner,
  isFeatul,
}: {
  toneFooterClass: string;
  authorLabel: string;
  avatarSrc: string;
  boardLabel: string;
  dateLabel: string;
  commentCount: number;
  role?: "admin" | "member" | "viewer" | null;
  isOwner?: boolean;
  isFeatul?: boolean;
}) {
  return (
    <div
      className={`mt-auto flex items-center gap-2 rounded-b-[inherit] border-t border-border/60 px-4 py-2.5 ${toneFooterClass}`}
    >
      <Avatar className="relative size-6 shrink-0 overflow-visible bg-card ring-1 ring-border/70 dark:bg-black/50">
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
      <div className="ml-auto grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 text-xs text-accent">
        <span className="inline-flex h-6 min-w-0 items-center gap-1.5 truncate rounded-md border border-border/60 bg-background/70 px-2 text-xs font-medium text-accent">
          <TagIcon className="size-3.5 shrink-0 text-accent/90" size={13} />
          <span className="truncate whitespace-nowrap">{boardLabel}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
          <CalendarIcon className="size-3.5" />
          <span>{dateLabel}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
          <FillCommentIcon className="size-3.5" size={14} />
          <span className="tabular-nums">{commentCount}</span>
        </span>
      </div>
    </div>
  );
}

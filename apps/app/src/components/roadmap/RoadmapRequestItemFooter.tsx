"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import CalendarIcon from "@featul/ui/icons/calendar";
import FillCommentIcon from "@featul/ui/icons/fill-comment";
import RoleBadge from "@/components/global/RoleBadge";
import { getInitials } from "@/utils/user";

export default function RoadmapRequestItemFooter({
  toneFooterClass,
  authorLabel,
  avatarSrc,
  dateLabel,
  commentCount,
  role,
  isOwner,
  isFeatul,
}: {
  toneFooterClass: string;
  authorLabel: string;
  avatarSrc: string;
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
      <div className="flex min-w-0 items-center gap-2">
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
        <span className="truncate text-sm font-medium text-foreground/90">
          {authorLabel}
        </span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3 text-xs text-accent">
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="size-3.5" />
          <span>{dateLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FillCommentIcon className="size-3.5" size={14} />
          <span className="tabular-nums">{commentCount}</span>
        </span>
      </div>
    </div>
  );
}

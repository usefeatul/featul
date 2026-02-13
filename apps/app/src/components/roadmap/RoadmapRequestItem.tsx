"use client";

import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import RoleBadge from "@/components/global/RoleBadge";
import { getInitials } from "@/utils/user-utils";
import { randomAvatarUrl } from "@/utils/avatar";

export type RoadmapItemData = {
  id: string;
  title: string;
  slug: string;
  roadmapStatus: string | null;
  boardName: string;
  boardSlug?: string;
  upvotes: number;
  commentCount: number;
  authorImage?: string | null;
  authorName?: string | null;
  authorId?: string | null;
  role?: "admin" | "member" | "viewer" | null;
  isOwner?: boolean;
  isFeatul?: boolean;
};

export default function RoadmapRequestItem({
  item,
  workspaceSlug,
}: {
  item: RoadmapItemData;
  workspaceSlug: string;
}) {
  const href = `/workspaces/${workspaceSlug}/requests/${item.slug}`;
  const authorLabel = item.authorName?.trim() || "Guest";
  const authorSeed = item.authorId || item.id || item.slug;
  const avatarSrc =
    item.authorImage || randomAvatarUrl(authorSeed, "avataaars");
  const upvotes = Math.max(0, Number(item.upvotes || 0));
  const commentCount = Math.max(0, Number(item.commentCount || 0));
  const boardLabel = item.boardName?.trim() || "Board";

  return (
    <div className="flex flex-col w-full min-w-0 overflow-visible">
      <Link
        href={href}
        className="min-w-0 line-clamp-2 text-sm font-medium leading-5 text-foreground hover:text-primary"
      >
        {item.title}
      </Link>
      <div className="mt-3 flex items-center gap-2 text-xs text-accent">
        <Avatar className="size-6 shrink-0 ring-1 ring-border/70 relative overflow-visible">
          <AvatarImage src={avatarSrc} alt={authorLabel} />
          <AvatarFallback className="text-[10px] font-medium">
            {getInitials(authorLabel)}
          </AvatarFallback>
          <RoleBadge
            role={item.role}
            isOwner={item.isOwner}
            isFeatul={item.isFeatul}
            className="-bottom-1! -right-1! bg-background dark:bg-background"
          />
        </Avatar>
        <span className="inline-flex h-6 min-w-0 max-w-[120px] items-center truncate rounded-md border border-border bg-background px-1.5 text-[11px] leading-none text-accent">
          {boardLabel}
        </span>
        <div className="ml-auto inline-flex h-6 shrink-0 items-center gap-2">
          <span className="inline-flex h-6 items-center gap-1 leading-none">
            <Heart className="size-3.5" aria-hidden />
            <span className="tabular-nums">{upvotes}</span>
          </span>
          <span className="inline-flex h-6 items-center gap-1 leading-none">
            <MessageCircle className="size-3.5" aria-hidden />
            <span className="tabular-nums">{commentCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

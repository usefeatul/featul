"use client";

import Link from "next/link";
import { MessageCircle, Heart } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user-utils";
import { randomAvatarUrl } from "@/utils/avatar";

export type RoadmapItemData = {
  id: string;
  title: string;
  slug: string;
  roadmapStatus: string | null;
  upvotes: number;
  commentCount: number;
  authorImage?: string | null;
  authorName?: string | null;
  authorId?: string | null;
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

  return (
    <div className="flex flex-col w-full min-w-0 overflow-hidden">
      <Link
        href={href}
        className="min-w-0 line-clamp-2 text-sm font-medium leading-5 text-foreground hover:text-primary"
      >
        {item.title}
      </Link>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-accent">
        <Avatar className="size-6 ring-1 ring-border/70">
          <AvatarImage src={avatarSrc} alt={authorLabel} />
          <AvatarFallback className="text-[10px] font-medium">
            {getInitials(authorLabel)}
          </AvatarFallback>
        </Avatar>
        <div className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-3.5" aria-hidden />
            <span className="tabular-nums">{upvotes}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="size-3.5" aria-hidden />
            <span className="tabular-nums">{commentCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

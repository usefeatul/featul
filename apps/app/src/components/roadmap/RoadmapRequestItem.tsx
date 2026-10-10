"use client";

import Link from "next/link";
import RoadmapRequestItemFooter from "@/components/roadmap/RoadmapRequestItemFooter";
import { FlagRibbon } from "@/components/global/FlagRibbon";
import {
  buildRoadmapPreview,
  formatRoadmapCardDate,
} from "@/components/roadmap/card";
import { randomAvatarUrl } from "@/utils/avatar";

export type RoadmapItemData = {
  id: string;
  title: string;
  slug: string;
  roadmapStatus: string | null;
  content?: string | null;
  boardName: string;
  boardSlug?: string;
  createdAt?: string | null;
  publishedAt?: string | null;
  commentCount: number;
  upvotes: number;
  hasVoted?: boolean;
  authorImage?: string | null;
  authorName?: string | null;
  authorId?: string | null;
  role?: "admin" | "member" | "viewer" | null;
  isOwner?: boolean;
  isFeatul?: boolean;
  isPinned?: boolean;
  isFeatured?: boolean;
  isLocked?: boolean;
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
  const commentCount = Math.max(0, Number(item.commentCount || 0));
  const boardLabel = item.boardName?.trim() || "Board";
  const preview = buildRoadmapPreview(item.content, item.boardName);
  const dateLabel =
    formatRoadmapCardDate(item.publishedAt || item.createdAt) || "No date";
  return (
    <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[inherit]">
      <FlagRibbon
        isPinned={item.isPinned}
        isFeatured={item.isFeatured}
        isLocked={item.isLocked}
      />
      <div className="min-h-0 flex-1 px-2.5 pt-2.5">
        <Link
          href={href}
          className="line-clamp-2 block text-sm font-medium leading-5 text-foreground/95 hover:text-primary"
        >
          {item.title}
        </Link>
        <p className="mt-1 line-clamp-1 text-xs leading-4 text-muted-foreground">
          {preview}
        </p>
      </div>
      <RoadmapRequestItemFooter
        authorLabel={authorLabel}
        avatarSrc={avatarSrc}
        boardLabel={boardLabel}
        dateLabel={dateLabel}
        commentCount={commentCount}
        postId={item.id}
        upvotes={item.upvotes}
        hasVoted={item.hasVoted}
        role={item.role}
        isOwner={item.isOwner}
        isFeatul={item.isFeatul}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import RoadmapRequestItemFooter from "@/components/roadmap/RoadmapRequestItemFooter";
import { FlagRibbon } from "@/components/global/FlagRibbon";
import {
  buildRoadmapPreview,
  formatRoadmapCardDate,
  getRoadmapStatusTone,
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
  const tone = getRoadmapStatusTone(item.roadmapStatus);

  return (
    <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[inherit]">
      <FlagRibbon isPinned={item.isPinned} isFeatured={item.isFeatured} isLocked={item.isLocked} />
      <div className="min-h-0 flex-1 px-3.5 pb-3 pt-3.5">
        <Link
          href={href}
          className="line-clamp-2 block min-h-10 text-sm font-medium leading-5 text-foreground hover:text-primary"
        >
          {item.title}
        </Link>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-accent/90">
          {preview}
        </p>
      </div>
      <RoadmapRequestItemFooter
        toneFooterClass={tone.footer}
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

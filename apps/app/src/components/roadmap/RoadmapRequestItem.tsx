"use client";

import Link from "next/link";
import RoadmapRequestItemFooter from "@/components/roadmap/RoadmapRequestItemFooter";
import RoadmapQuickPreview from "@/components/roadmap/RoadmapQuickPreview";
import { FlagRibbon } from "@/components/global/FlagRibbon";
import { ReportIndicator } from "@/components/requests/ReportIndicator";
import {
  buildRoadmapPreview,
  formatRoadmapCardDate,
  getRoadmapStatusTone,
} from "@/components/roadmap/card";
import { randomAvatarUrl } from "@/utils/avatar";
import type { TagSummary } from "@/types/post";

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
  reportCount?: number;
  tags?: TagSummary[];
};

export default function RoadmapRequestItem({
  item,
  workspaceSlug,
  showPreview = true,
  linkBase,
}: {
  item: RoadmapItemData;
  workspaceSlug: string;
  showPreview?: boolean;
  linkBase?: string;
}) {
  const href = linkBase
    ? `${linkBase}/${item.slug}`
    : `/workspaces/${workspaceSlug}/requests/${item.slug}`;
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
  const visibleTags = (item.tags || []).slice(0, 2);

  return (
    <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[inherit]">
      <FlagRibbon isPinned={item.isPinned} isFeatured={item.isFeatured} />
      {showPreview ? (
        <RoadmapQuickPreview item={item} workspaceSlug={workspaceSlug} />
      ) : null}
      <div className="min-h-0 flex-1 px-3.5 pb-2 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={href}
            className="line-clamp-2 block min-h-10 flex-1 text-sm font-medium leading-5 text-foreground hover:text-primary"
            onClick={(event) => event.stopPropagation()}
          >
            {item.title}
          </Link>
          <ReportIndicator count={item.reportCount || 0} className="shrink-0" />
        </div>
        <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-accent/90">
          {preview}
        </p>
        {visibleTags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}
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

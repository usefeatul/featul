"use client";

import Link from "next/link";
import StatusIcon from "@/components/requests/StatusIcon";
import RoadmapRequestItemFooter from "@/components/roadmap/RoadmapRequestItemFooter";
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
  const commentCount = Math.max(0, Number(item.commentCount || 0));
  const boardLabel = item.boardName?.trim() || "Board";
  const preview = buildRoadmapPreview(item.content, item.boardName);
  const dateLabel =
    formatRoadmapCardDate(item.publishedAt || item.createdAt) || "No date";
  const tone = getRoadmapStatusTone(item.roadmapStatus);

  return (
    <div className="flex min-h-[158px] w-full min-w-0 flex-col overflow-hidden rounded-[inherit]">
      <div className="px-4 pb-4 pt-4">
        <div className="flex items-start gap-3">
          <Link
            href={href}
            className="min-w-0 flex-1 text-base font-semibold leading-6 text-foreground hover:text-primary whitespace-normal break-words"
          >
            {item.title}
          </Link>
          <span className="inline-flex shrink-0 items-center justify-center">
            <StatusIcon
              status={item.roadmapStatus || undefined}
              className={`size-5 ${tone.icon}`}
            />
          </span>
        </div>
        <p className="mt-2 text-sm leading-5 text-accent/90 whitespace-normal break-words">
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
        role={item.role}
        isOwner={item.isOwner}
        isFeatul={item.isFeatul}
      />
    </div>
  );
}

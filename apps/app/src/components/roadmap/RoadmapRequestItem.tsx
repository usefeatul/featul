"use client";

import Link from "next/link";
import { CalendarDays, MessageCircle } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import RoleBadge from "@/components/global/RoleBadge";
import StatusIcon from "@/components/requests/StatusIcon";
import { normalizeRoadmapStatus, type RoadmapStatus } from "@/lib/roadmap";
import { getInitials } from "@/utils/user";
import { randomAvatarUrl } from "@/utils/avatar";

const STATUS_TONES: Record<
  RoadmapStatus,
  { footer: string; iconWrap: string; icon: string }
> = {
  pending: {
    footer: "bg-zinc-100/80 dark:bg-zinc-500/10",
    iconWrap: "border-zinc-300 bg-zinc-100 dark:border-zinc-300/40 dark:bg-zinc-500/10",
    icon: "text-zinc-500 dark:text-zinc-300",
  },
  review: {
    footer: "bg-violet-50/80 dark:bg-violet-500/10",
    iconWrap: "border-violet-200 bg-violet-50 dark:border-violet-300/40 dark:bg-violet-500/10",
    icon: "text-violet-500 dark:text-violet-300",
  },
  planned: {
    footer: "bg-amber-50/80 dark:bg-amber-500/10",
    iconWrap: "border-amber-200 bg-amber-50 dark:border-amber-300/40 dark:bg-amber-500/10",
    icon: "text-amber-500 dark:text-amber-300",
  },
  progress: {
    footer: "bg-blue-50/80 dark:bg-blue-500/10",
    iconWrap: "border-blue-200 bg-blue-50 dark:border-blue-300/40 dark:bg-blue-500/10",
    icon: "text-blue-500 dark:text-blue-300",
  },
  completed: {
    footer: "bg-emerald-50/80 dark:bg-emerald-500/10",
    iconWrap: "border-emerald-200 bg-emerald-50 dark:border-emerald-300/40 dark:bg-emerald-500/10",
    icon: "text-emerald-500 dark:text-emerald-300",
  },
  closed: {
    footer: "bg-red-50/80 dark:bg-red-500/10",
    iconWrap: "border-red-200 bg-red-50 dark:border-red-300/40 dark:bg-red-500/10",
    icon: "text-red-500 dark:text-red-300",
  },
};

function toPlain(s?: string | null): string {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatRoadmapDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(parsed);
}

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
  const preview = toPlain(item.content) || `In ${boardLabel} board`;
  const dateLabel =
    formatRoadmapDate(item.publishedAt || item.createdAt) || "No date";
  const normalizedStatus = normalizeRoadmapStatus(item.roadmapStatus);
  const tone = STATUS_TONES[normalizedStatus];

  return (
    <div className="flex min-h-[158px] w-full min-w-0 flex-col overflow-hidden rounded-[inherit]">
      <div className="px-4 pb-4 pt-4">
        <div className="flex items-start gap-3">
          <Link
            href={href}
            className="min-w-0 flex-1 line-clamp-2 text-base font-semibold leading-6 text-foreground hover:text-primary"
          >
            {item.title}
          </Link>
          <span
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full border ${tone.iconWrap}`}
          >
            <StatusIcon
              status={item.roadmapStatus || undefined}
              className={`size-4 ${tone.icon}`}
            />
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-accent/90">
          {preview}
        </p>
      </div>
      <div
        className={`mt-auto flex items-center gap-2 rounded-b-[inherit] border-t border-border/60 px-4 py-2.5 ${tone.footer}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Avatar className="relative size-6 shrink-0 overflow-visible bg-card ring-1 ring-border/70 dark:bg-black/50">
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
          <span className="truncate text-sm font-medium text-foreground/90">
            {authorLabel}
          </span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3 text-xs text-accent">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            <span>{dateLabel}</span>
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

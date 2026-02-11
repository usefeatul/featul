"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar";
import { getDisplayUser, getInitials } from "@/utils/user-utils";
import { relativeTime } from "@/lib/time";
import BoardPicker from "./meta/BoardPicker";
import StatusPicker from "./meta/StatusPicker";
import FlagsPicker from "./meta/FlagsPicker";
import TagsPicker from "./meta/TagsPicker";
import StatusIcon from "./StatusIcon";
import RoleBadge from "../global/RoleBadge";
import type { RequestDetailData } from "@/types/request";
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip";
import { CircleQuestionMarkIcon } from "@featul/ui/icons/circle-question-mark";

export type RequestDetailSidebarProps = {
  post: RequestDetailData;
  workspaceSlug: string;
  readonly?: boolean;
};

export default function RequestDetailSidebar({
  post,
  workspaceSlug,
  readonly,
}: RequestDetailSidebarProps) {
  const canEdit = !readonly;

  const [meta, setMeta] = React.useState({
    roadmapStatus: post.roadmapStatus || undefined,
    isPinned: !!post.isPinned,
    isLocked: !!post.isLocked,
    isFeatured: !!post.isFeatured,
  });
  const [board, setBoard] = React.useState({
    name: post.boardName,
    slug: post.boardSlug,
  });
  const [tags, setTags] = React.useState(post.tags || []);

  const displayAuthor = getDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined
  );
  const authorInitials = getInitials(displayAuthor.name);

  const timeLabel = relativeTime(post.publishedAt ?? post.createdAt);

  return (
    <aside className="hidden h-full md:block">
      <div className="h-full px-4 py-4 md:px-6 md:py-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative">
            <Avatar className="relative size-10 overflow-visible">
              {displayAuthor.image ? (
                <AvatarImage
                  src={displayAuthor.image}
                  alt={displayAuthor.name}
                  className={displayAuthor.image?.includes('data:image/svg+xml') ? 'p-1' : ''}
                />
              ) : (
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  {authorInitials}
                </AvatarFallback>
              )}
              <RoleBadge
                role={post.role}
                isOwner={post.isOwner}
                isFeatul={post.isFeatul}
                className="-bottom-1 -right-1 bg-card"
              />
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {displayAuthor.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeLabel}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Board
            </span>
            {canEdit ? (
              <BoardPicker
                workspaceSlug={workspaceSlug}
                postId={post.id}
                value={board}
                onChange={setBoard}
              />
            ) : (
              <div className="flex h-6 items-center rounded-md border px-2.5 text-xs font-medium">
                {board.name}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Status
            </span>
            {canEdit ? (
              <StatusPicker
                postId={post.id}
                value={meta.roadmapStatus}
                onChange={(v) => setMeta((m) => ({ ...m, roadmapStatus: v }))}
              />
            ) : (
              <div className="flex h-8 items-center rounded-md border  px-2 pl-1.5 text-xs font-medium capitalize">
                <StatusIcon
                  status={meta.roadmapStatus || "pending"}
                  className="mr-2 size-4"
                />
                {meta.roadmapStatus || "Open"}
              </div>
            )}
          </div>

          {(canEdit || meta.isPinned || meta.isLocked || meta.isFeatured) && (
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-sm font-medium text-muted-foreground">
                Flags
              </span>
              {canEdit ? (
                <FlagsPicker
                  postId={post.id}
                  value={meta}
                  onChange={(v) => setMeta((m) => ({ ...m, ...v }))}
                />
              ) : (
                <div className="flex gap-1">
                  {[
                    meta.isPinned ? "Pinned" : null,
                    meta.isLocked ? "Locked" : null,
                    meta.isFeatured ? "Featured" : null,
                  ]
                    .filter(Boolean)
                    .map((f) => (
                      <span
                        key={f as string}
                        className="rounded-md border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}

          {(post.tags && post.tags.length > 0) || canEdit ? (
            <div className="pt-1">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <span>Tags</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label="About tags"
                          className="inline-flex items-center rounded-sm text-accent hover:text-foreground"
                        >
                          <CircleQuestionMarkIcon className="size-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        Tags categorize requests for filtering and reporting.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {canEdit ? (
                    <TagsPicker
                      workspaceSlug={workspaceSlug}
                      postId={post.id}
                      value={tags}
                      onChange={setTags}
                    />
                  ) : null}
                </div>
                {tags && tags.length > 0 ? (
                  <div className="flex w-full flex-wrap justify-start gap-1">
                    {tags.map((t) => (
                      <span
                        key={t.id}
                        className="rounded-sm bg-green-100 px-1.5 py-0.5 text-xs text-green-700"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {(post.duplicateOfId || (post.mergedSources && post.mergedSources.length > 0)) ? (
            <div className="space-y-3">
              <div className="h-px w-full bg-border/50" />
              <div>
                <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <span>Merge submission</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="About merges"
                        className="inline-flex items-center rounded-sm text-accent hover:text-foreground"
                      >
                        <CircleQuestionMarkIcon className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={6}>
                      Shows when requests are merged to consolidate duplicates.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              {post.duplicateOfId ? (
                <div className="rounded-md bg-card border border-border/50 p-3">
                  <div className="flex flex-col gap-2">
                    <Link
                      href={post.mergedInto ? `/workspaces/${workspaceSlug}/requests/${post.mergedInto.slug}` : "#"}
                      className="text-sm font-medium"
                    >
                      {post.mergedInto?.title || "Merged request"}
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-light">
                      <StatusIcon status={post.mergedInto?.roadmapStatus || "pending"} className="size-4" />
                      <span className="capitalize">{post.mergedInto?.roadmapStatus || "Open"}</span>
                      {post.mergedInto?.boardName ? (
                        <span className="text-accent">{post.mergedInto.boardName}</span>
                      ) : null}
                      <span className="text-accent">
                        {relativeTime(post.mergedInto?.mergedAt || post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
              {post.mergedSources && post.mergedSources.length > 0 ? (
                <div className="rounded-md bg-card border border-border/50 p-3">
                  <div className="space-y-3">
                    {post.mergedSources.map((src) => (
                      <div key={src.id} className="flex flex-col gap-2">
                        <Link href={`/workspaces/${workspaceSlug}/requests/${src.slug}`} className="text-sm font-medium block">
                          {src.title}
                        </Link>
                        <div className="flex items-center gap-2 text-xs font-light">
                          <StatusIcon status={src.roadmapStatus || "pending"} className="size-4" />
                          <span className="capitalize">{src.roadmapStatus || "Open"}</span>
                          {src.boardName ? <span className="text-accent">{src.boardName}</span> : null}
                          <span className="text-accent">{relativeTime(src.mergedAt || post.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

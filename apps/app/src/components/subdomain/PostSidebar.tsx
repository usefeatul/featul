"use client";

import React from "react";
import { usePostEditAccess } from "@/hooks/usePostEditAccess";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@featul/ui/components/avatar";
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user";
import { relativeTime } from "@/lib/time";
import BoardPicker from "../requests/meta/BoardPicker";
import StatusPicker from "../requests/meta/StatusPicker";
import FlagsPicker from "../requests/meta/FlagsPicker";
import { StatusChip } from "./StatusChip";
import { ShareIdeaButton } from "./ShareIdeaButton";
import { BoardIcon } from "@/components/global/icons";
import { PostActionsNav } from "./request/PostActionsNav";
import { RequestFlagReadout } from "@/components/global/flag-visuals";
import type { SubdomainRequestDetailData } from "@/types/subdomain";

export type PostSidebarProps = {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
};

export default function PostSidebar({ post, workspaceSlug }: PostSidebarProps) {
  const { canEdit } = usePostEditAccess({
    workspaceSlug,
    viewerCanEdit: post.viewerCanEdit,
  });

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

  const displayUser = getPrivacySafeDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined,
    post.hidePublicMemberIdentity,
    post.id,
  );

  const authorInitials = getInitials(displayUser.name);
  const timeLabel = relativeTime(post.publishedAt ?? post.createdAt);

  return (
    <aside className="hidden min-w-0 md:block md:pt-1">
      <div className="space-y-6 md:sticky md:top-20">
        <ShareIdeaButton className="w-full" />

        <section>
          <h2 className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            Details
          </h2>
          <dl className="space-y-0.5">
            <DetailRow label="Board">
              {canEdit ? (
                <BoardPicker
                  workspaceSlug={workspaceSlug}
                  postId={post.id}
                  value={board}
                  onChange={setBoard}
                />
              ) : (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <BoardIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{board.name}</span>
                </span>
              )}
            </DetailRow>

            <DetailRow label="Created by">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Avatar className="size-5 shrink-0">
                  {displayUser.image ? (
                    <AvatarImage
                      src={displayUser.image}
                      alt={displayUser.name}
                      className={
                        displayUser.image?.includes("data:image/svg+xml")
                          ? "p-0.5"
                          : ""
                      }
                    />
                  ) : (
                    <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">
                      {authorInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="truncate">{displayUser.name}</span>
              </span>
            </DetailRow>

            <DetailRow label="Date">
              <span suppressHydrationWarning>{timeLabel}</span>
            </DetailRow>

            <DetailRow label="Status">
              {canEdit ? (
                <StatusPicker
                  postId={post.id}
                  value={meta.roadmapStatus}
                  onChange={(v) => setMeta((m) => ({ ...m, roadmapStatus: v }))}
                />
              ) : (
                <StatusChip status={meta.roadmapStatus} className="text-sm" />
              )}
            </DetailRow>

            {canEdit || meta.isPinned || meta.isLocked || meta.isFeatured ? (
              <DetailRow label="Flags">
                {canEdit ? (
                  <FlagsPicker
                    postId={post.id}
                    value={meta}
                    onChange={(v) => setMeta((m) => ({ ...m, ...v }))}
                  />
                ) : (
                  <RequestFlagReadout
                    flags={meta}
                    className="flex flex-wrap items-center justify-end gap-1.5"
                    itemClassName="h-6 rounded-lg bg-muted/70 px-2 text-[11px] font-medium text-foreground/85 ring-1 ring-border/50 dark:bg-white/[0.055] dark:ring-white/[0.08]"
                  />
                )}
              </DetailRow>
            ) : null}
          </dl>
        </section>

        <PostActionsNav post={post} workspaceSlug={workspaceSlug} />
      </div>
    </aside>
  );
}

/** Label on the left, value on the right; no frame. */
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3 px-2.5 py-1">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 justify-end text-sm font-medium text-foreground">
        {children}
      </dd>
    </div>
  );
}

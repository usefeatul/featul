"use client"

import React from "react"
import { usePostEditAccess } from "@/hooks/usePostEditAccess"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user"
import { relativeTime } from "@/lib/time"
import BoardPicker from "../requests/meta/BoardPicker"
import StatusPicker from "../requests/meta/StatusPicker"
import FlagsPicker from "../requests/meta/FlagsPicker"
import StatusIcon from "../requests/StatusIcon"
import { PoweredBy } from "./PoweredBy"
import RoleBadge from "../global/RoleBadge"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"
import { cn } from "@featul/ui/lib/utils"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import { RequestFlagReadout } from "@/components/global/flag-visuals"
import type { SubdomainRequestDetailData } from "@/types/subdomain"

export type PostSidebarProps = {
  post: SubdomainRequestDetailData
  workspaceSlug: string
}

export default function PostSidebar({ post, workspaceSlug }: PostSidebarProps) {
  const { canEdit } = usePostEditAccess({ workspaceSlug, viewerCanEdit: post.viewerCanEdit })

  const [meta, setMeta] = React.useState({
    roadmapStatus: post.roadmapStatus || undefined,
    isPinned: !!post.isPinned,
    isLocked: !!post.isLocked,
    isFeatured: !!post.isFeatured,
  })
  const [board, setBoard] = React.useState({ name: post.boardName, slug: post.boardSlug })

  const displayUser = getPrivacySafeDisplayUser(
    post.author
      ? {
        name: post.author.name ?? undefined,
        image: post.author.image ?? undefined,
        email: post.author.email ?? undefined,
      }
      : undefined,
    post.hidePublicMemberIdentity,
    post.id
  )

  const isGuest = !post.author?.name || post.author.name === "Guest"
  const showHiddenIdentity = post.hidePublicMemberIdentity && !isGuest
  const authorInitials = getInitials(displayUser.name)
  const timeLabel = relativeTime(post.publishedAt ?? post.createdAt)

  return (
    <aside className="hidden min-w-0 flex-col gap-4 md:flex">
      <section className={settingsCardShellClass}>
        <header className="flex items-center gap-3 py-2">
          <div className="relative">
            <Avatar className="relative size-8 overflow-visible">
              {displayUser.image ? (
                <AvatarImage
                  src={displayUser.image}
                  alt={displayUser.name}
                  className={displayUser.image?.includes("data:image/svg+xml") ? "p-1" : ""}
                />
              ) : (
                <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                  {authorInitials}
                </AvatarFallback>
              )}
              {!showHiddenIdentity ? (
                <RoleBadge
                  role={post.role}
                  isOwner={post.isOwner}
                  isFeatul={post.isFeatul}
                  className="-bottom-1 -right-1 bg-card"
                />
              ) : null}
            </Avatar>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium leading-none text-foreground">
              {displayUser.name}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">{timeLabel}</span>
          </div>
        </header>

        <div className={settingsCardInnerClass}>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">Board</span>
              {canEdit ? (
                <BoardPicker
                  workspaceSlug={workspaceSlug}
                  postId={post.id}
                  value={board}
                  onChange={setBoard}
                />
              ) : (
                <Toolbar size="sm" className="w-fit">
                  <div className={cn(toolbarItemClass, "flex h-8 items-center px-2.5 text-xs font-medium")}>
                    {board.name}
                  </div>
                </Toolbar>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              {canEdit ? (
                <StatusPicker
                  postId={post.id}
                  value={meta.roadmapStatus}
                  onChange={(v) => setMeta((m) => ({ ...m, roadmapStatus: v }))}
                />
              ) : (
                <Toolbar size="sm" className="w-fit">
                  <div className={cn(toolbarItemClass, "flex h-8 items-center gap-1.5 px-2.5 text-xs font-medium capitalize")}>
                    <StatusIcon
                      status={meta.roadmapStatus || "pending"}
                      className="size-4"
                    />
                    {meta.roadmapStatus || "Open"}
                  </div>
                </Toolbar>
              )}
            </div>

            {(canEdit || meta.isPinned || meta.isLocked || meta.isFeatured) && (
              <div
                className={cn(
                  canEdit
                    ? "flex items-center justify-between"
                    : "flex flex-col gap-2",
                )}
              >
                <span className="text-sm font-medium text-muted-foreground">Flags</span>
                {canEdit ? (
                  <FlagsPicker
                    postId={post.id}
                    value={meta}
                    onChange={(v) => setMeta((m) => ({ ...m, ...v }))}
                  />
                ) : (
                  <RequestFlagReadout
                    flags={meta}
                    className="flex w-full flex-wrap items-center gap-1.5"
                    itemClassName="h-6 rounded-md bg-muted/70 px-2 text-[11px] font-medium text-foreground/85 ring-1 ring-border/50 dark:bg-white/[0.055] dark:ring-white/[0.08]"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <PoweredBy />
    </aside>
  )
}

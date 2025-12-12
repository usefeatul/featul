"use client"

import React from "react"
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess"
import { Avatar, AvatarImage, AvatarFallback } from "@oreilla/ui/components/avatar"
import { getDisplayUser, getInitials } from "@/utils/user-utils"
import { relativeTime } from "@/lib/time"
import BoardPicker from "./meta/BoardPicker"
import StatusPicker from "./meta/StatusPicker"
import FlagsPicker from "./meta/FlagsPicker"
import TagsPicker from "./meta/TagsPicker"
import StatusIcon from "./StatusIcon"
import RoleBadge from "../comments/RoleBadge"
import type { RequestDetailData } from "./RequestDetail"

export type RequestDetailSidebarProps = {
  post: RequestDetailData
  workspaceSlug: string
  readonly?: boolean
}

export default function RequestDetailSidebar({ post, workspaceSlug, readonly }: RequestDetailSidebarProps) {
  const { isOwner } = useWorkspaceRole(workspaceSlug)
  const canEdit = isOwner && !readonly

  const [meta, setMeta] = React.useState({
    roadmapStatus: post.roadmapStatus || undefined,
    isPinned: !!post.isPinned,
    isLocked: !!post.isLocked,
    isFeatured: !!post.isFeatured,
  })
  const [board, setBoard] = React.useState({ name: post.boardName, slug: post.boardSlug })

  const displayAuthor = getDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined
  )
  const authorInitials = getInitials(displayAuthor.name)

  const timeLabel = relativeTime(post.publishedAt ?? post.createdAt)

  return (
    <aside className="hidden md:block space-y-4">
      <div className="rounded-sm bg-card p-4 border">
        {/* Header: User & Time */}
        <div className="flex items-center gap-3 mb-6 ">
          <div className="relative ">
            <Avatar className="size-10 relative overflow-visible ">
              {displayAuthor.image ? (
                <AvatarImage src={displayAuthor.image} alt={displayAuthor.name} />
              ) : (
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">{authorInitials}</AvatarFallback>
              )}
              <RoleBadge role={post.role} isOwner={post.isOwner} className="-bottom-1 -right-1 bg-card" />
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{displayAuthor.name}</span>
            <span className="text-xs text-muted-foreground">{timeLabel}</span>
          </div>
        </div>

        {/* Properties */}
        <div className="space-y-5">
          {/* Board */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Board</span>
            {canEdit ? (
              <BoardPicker workspaceSlug={workspaceSlug} postId={post.id} value={board} onChange={setBoard} />
            ) : (
              <div className="h-6 px-2.5 rounded-sm border text-xs font-medium flex items-center">
                {board.name}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Status</span>
            {canEdit ? (
              <StatusPicker
                postId={post.id}
                value={meta.roadmapStatus}
                onChange={(v) => setMeta((m) => ({ ...m, roadmapStatus: v }))}
              />
            ) : (
              <div className="h-8 px-2 pl-1.5 rounded-md text-xs border font-medium flex items-center capitalize">
                <StatusIcon status={meta.roadmapStatus || "pending"} className="size-4 mr-2" />
                {meta.roadmapStatus || "Open"}
              </div>
            )}
          </div>

          {/* Flags */}
          {(canEdit || meta.isPinned || meta.isLocked || meta.isFeatured) && (
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground font-medium">Flags</span>
              {canEdit ? (
                <FlagsPicker
                  postId={post.id}
                  value={meta}
                  onChange={(v) => setMeta((m) => ({ ...m, ...v }))}
                />
              ) : (
                <div className="flex gap-1 ">
                  {[
                    meta.isPinned ? "Pinned" : null,
                    meta.isLocked ? "Locked" : null,
                    meta.isFeatured ? "Featured" : null,
                  ]
                    .filter(Boolean)
                    .map((f) => (
                      <span
                        key={f as string}
                        className="text-xs bg-muted px-1.5 py-0.5 rounded-sm  border text-muted-foreground "
                      >
                        {f}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {(post.tags && post.tags.length > 0) || canEdit ? (
            <div className="pt-1">
              <div className="flex items-start justify-between gap-1">
                <span className="text-sm text-muted-foreground font-medium">Tags</span>
                {canEdit ? (
                  <TagsPicker workspaceSlug={workspaceSlug} postId={post.id} value={post.tags || []} />
                ) : post.tags && post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 justify-start ">
                    {post.tags.map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] rounded-md bg-green-100 px-2 py-0.5 text-green-500"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}


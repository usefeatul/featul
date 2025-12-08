"use client"

import React from "react"
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess"
import { Avatar, AvatarImage, AvatarFallback } from "@feedgot/ui/components/avatar"
import { getDisplayUser, getInitials } from "@/utils/user-utils"
import BoardPicker from "../requests/meta/BoardPicker"
import StatusPicker from "../requests/meta/StatusPicker"
import FlagsPicker from "../requests/meta/FlagsPicker"
import StatusIcon from "../requests/StatusIcon"
import { PoweredBy } from "./PoweredBy"
import RoleBadge from "../comments/RoleBadge"

export type PostSidebarProps = {
  post: {
    id: string
    publishedAt: string | null
    createdAt: string
    boardName: string
    boardSlug: string
    roadmapStatus: string | null
    isPinned?: boolean
    isLocked?: boolean
    isFeatured?: boolean
    role?: "admin" | "member" | "viewer" | null
    isOwner?: boolean
    author?: {
      name: string | null
      image: string | null
      email: string | null
    } | null
  }
  workspaceSlug: string
}

export default function PostSidebar({ post, workspaceSlug }: PostSidebarProps) {
  const date = new Date(post.publishedAt ?? post.createdAt)
  const formatted = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(date)

  // Permission check: Only owner (creator) can edit
  const { isOwner } = useWorkspaceRole(workspaceSlug)
  const canEdit = isOwner

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

  return (
    <aside className="space-y-4">
      <div className="rounded-md bg-card p-3 space-y-4 border">
        {/* Author */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-accent">Author</span>
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              {displayAuthor.image ? (
                <AvatarImage src={displayAuthor.image} alt={displayAuthor.name} />
              ) : (
                <AvatarFallback className="text-[10px]">{authorInitials}</AvatarFallback>
              )}
            </Avatar>
            <span className="text-xs font-medium">{displayAuthor.name}</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-accent">Date</span>
          <span className="text-xs text-accent">{formatted}</span>
        </div>

        {/* Board */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-accent">Board</span>
          {canEdit ? (
            <BoardPicker workspaceSlug={workspaceSlug} postId={post.id} value={board} onChange={setBoard} />
          ) : (
            <span className="text-xs font-medium">{board.name}</span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-accent">Status</span>
          {canEdit ? (
            <StatusPicker
              postId={post.id}
              value={meta.roadmapStatus}
              onChange={(v) => setMeta((m) => ({ ...m, roadmapStatus: v }))}
            />
          ) : (
            <div className="flex items-center gap-1.5">
              {meta.roadmapStatus && <StatusIcon status={meta.roadmapStatus} className="size-3" />}
              <span className="text-xs font-medium capitalize">{meta.roadmapStatus || "Open"}</span>
            </div>
          )}
        </div>

        {/* Flags */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-accent">Flags</span>
          {canEdit ? (
            <FlagsPicker
              postId={post.id}
              value={meta}
              onChange={(v) => setMeta((m) => ({ ...m, ...v }))}
            />
          ) : (
            <span className="text-xs font-medium capitalize">
              {[
                meta.isPinned ? "pinned" : null,
                meta.isLocked ? "locked" : null,
                meta.isFeatured ? "featured" : null,
              ]
                .filter(Boolean)
                .join(", ") || "None"}
            </span>
          )}
        </div>
      </div>
      <PoweredBy />
    </aside>
  )
}

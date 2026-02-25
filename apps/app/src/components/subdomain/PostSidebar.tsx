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
import { Badge } from "@featul/ui/components/badge"
import { PoweredBy } from "./PoweredBy"
import RoleBadge from "../global/RoleBadge"


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
    isFeatul?: boolean
    viewerCanEdit?: boolean
    hidePublicMemberIdentity?: boolean
    author?: {
      name: string | null
      image: string | null
      email: string | null
    } | null
  }
  workspaceSlug: string
}

export default function PostSidebar({ post, workspaceSlug }: PostSidebarProps) {
  // Permission check: allow server-evaluated access (owner/admin/permissions) and fall back to client role
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
    post.id // Use post ID as seed
  )

  // We still need to know if we are hiding identity to toggle RoleBadge
  // We can infer it: if we asked to hide, and name is "Member" (and original wasn't Guest), then it's hidden.
  // Or just re-use the simple boolean check for the badge
  const isGuest = !post.author?.name || post.author.name === "Guest" // Original check
  // Actually getPrivacySafeDisplayUser handles the "Guest" logic inside.
  // If we pass hide=true and it returns "Member", then it was hidden.
  const showHiddenIdentity = post.hidePublicMemberIdentity && !isGuest

  const authorInitials = getInitials(displayUser.name)

  const timeLabel = relativeTime(post.publishedAt ?? post.createdAt)

  return (
    <aside className="hidden md:block space-y-4 min-w-0">
      <div className="rounded-xl bg-card dark:bg-background p-4 border ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
        {/* Header: User & Time */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Avatar className="size-10 relative overflow-visible">
              {displayUser.image ? (
                <AvatarImage
                  src={displayUser.image}
                  alt={displayUser.name}
                  className={displayUser.image?.includes('data:image/svg+xml') ? 'p-1.5' : ''}
                />
              ) : (
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">{authorInitials}</AvatarFallback>
              )}
              {!showHiddenIdentity && <RoleBadge role={post.role} isOwner={post.isOwner} isFeatul={post.isFeatul} className="-bottom-1 -right-0.5" />}
            </Avatar>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">{displayUser.name}</span>
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
              <div className="h-6 px-2.5 rounded-md border text-xs font-medium flex items-center">
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
              <div className="h-8 px-2 pl-1.5 rounded-md  text-xs border font-medium flex items-center capitalize">
                <StatusIcon status={meta.roadmapStatus || "pending"} className="size-4 mr-2" />
                {meta.roadmapStatus || "Open"}
              </div>
            )}
          </div>

          {/* Flags */}
          {(canEdit || meta.isPinned || meta.isLocked || meta.isFeatured) && (
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-sm text-muted-foreground font-medium leading-6 shrink-0">Flags</span>
              {canEdit ? (
                <FlagsPicker
                  postId={post.id}
                  value={meta}
                  onChange={(v) => setMeta((m) => ({ ...m, ...v }))}
                  className="ml-auto shrink-0"
                />
              ) : (
                <div className="ml-auto flex-1 min-w-0 flex flex-wrap justify-end gap-1.5">
                  {[
                    meta.isPinned ? "Pinned" : null,
                    meta.isLocked ? "Locked" : null,
                    meta.isFeatured ? "Featured" : null,
                  ]
                    .filter(Boolean)
                    .map((f) => (
                      <Badge
                        key={f}
                        variant="nav"
                        className="bg-muted dark:bg-black/50 text-muted-foreground border border-border px-2 py-0.5 text-xs font-medium rounded-md"
                      >
                        {f}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <PoweredBy />
    </aside>
  )
}

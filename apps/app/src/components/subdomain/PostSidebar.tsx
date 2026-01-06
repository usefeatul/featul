"use client"

import React from "react"
import { useWorkspaceRole } from "@/hooks/useWorkspaceAccess"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { getDisplayUser, getInitials } from "@/utils/user-utils"
import { relativeTime } from "@/lib/time"
import BoardPicker from "../requests/meta/BoardPicker"
import StatusPicker from "../requests/meta/StatusPicker"
import FlagsPicker from "../requests/meta/FlagsPicker"
import StatusIcon from "../requests/StatusIcon"
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
    author?: {
      name: string | null
      image: string | null
      email: string | null
    } | null
  }
  workspaceSlug: string
}

export default function PostSidebar({ post, workspaceSlug }: PostSidebarProps) {
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
  
  const timeLabel = relativeTime(post.publishedAt ?? post.createdAt)

  return (
    <aside className="hidden md:block space-y-4">
      <div className="rounded-xl bg-card p-4 border ring-1 ring-border/60 ring-offset-1 ring-offset-background">
        {/* Header: User & Time */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Avatar className="size-10 relative overflow-visible">
              {displayAuthor.image ? (
                <AvatarImage 
                  src={displayAuthor.image} 
                  alt={displayAuthor.name}
                  className={displayAuthor.image?.includes('data:image/svg+xml') ? 'p-1.5' : ''}
                />
              ) : (
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">{authorInitials}</AvatarFallback>
              )}
              <RoleBadge role={post.role} isOwner={post.isOwner} isFeatul={post.isFeatul} className="-bottom-1 -right-0.5" />
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
             <div className="flex items-center justify-between">
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
                    ].filter(Boolean).map(f => (
                       <span key={f} className="text-xs bg-muted px-1.5 py-0.5 rounded-md border text-muted-foreground ">{f}</span>
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

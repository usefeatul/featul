"use client"

import React from "react"
import Link from "next/link"
import { usePostEditAccess } from "@/hooks/usePostEditAccess"
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { getInitials, getPrivacySafeDisplayUser } from "@/utils/user"
import { relativeTime } from "@/lib/time"
import BoardPicker from "../requests/meta/BoardPicker"
import StatusPicker from "../requests/meta/StatusPicker"
import FlagsPicker from "../requests/meta/FlagsPicker"
import TagsPicker from "../requests/meta/TagsPicker"
import StatusIcon from "../requests/StatusIcon"
import { PoweredBy } from "./PoweredBy"
import RoleBadge from "../global/RoleBadge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip"
import { CircleQuestionMarkIcon } from "@featul/ui/icons/circle-question-mark"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"
import { cn } from "@featul/ui/lib/utils"
import type { SubdomainRequestDetailData } from "@/types/subdomain"

export type PostSidebarProps = {
  post: SubdomainRequestDetailData
  workspaceSlug: string
}

function publicRequestHref(slug: string) {
  return `/board/p/${slug}`
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
  const [tags, setTags] = React.useState(post.tags || [])

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
            <div className="flex items-center justify-between">
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

            <div className="flex items-center justify-between">
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
              <div className="-mx-4 flex items-center justify-between border-b border-border/50 px-4 pb-3">
                <span className="text-sm font-medium text-muted-foreground">Flags</span>
                {canEdit ? (
                  <FlagsPicker
                    postId={post.id}
                    value={meta}
                    onChange={(v) => setMeta((m) => ({ ...m, ...v }))}
                  />
                ) : (
                  <Toolbar size="sm" className="w-fit">
                    <div className={cn(toolbarItemClass, "flex h-8 items-center gap-1.5 px-2.5 text-xs font-medium")}>
                      {[
                        meta.isPinned ? "Pinned" : null,
                        meta.isLocked ? "Locked" : null,
                        meta.isFeatured ? "Featured" : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </Toolbar>
                )}
              </div>
            )}

            {(tags.length > 0) || canEdit ? (
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
                  {tags.length > 0 ? (
                    <div className="flex w-full flex-wrap justify-start gap-1.5">
                      {tags.map((t) => (
                        <Toolbar key={t.id} size="sm" className="w-fit">
                          <span
                            className={cn(
                              toolbarItemClass,
                              "flex h-8 items-center bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/15 dark:bg-primary/10 dark:hover:bg-primary/15",
                            )}
                          >
                            {t.name}
                          </span>
                        </Toolbar>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {(post.duplicateOfId || (post.mergedSources && post.mergedSources.length > 0)) ? (
              <div className="space-y-3">
                <div className="-mx-4 h-px bg-border/50" />
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
                  <div className="rounded-lg border border-border bg-background">
                    <Link
                      href={post.mergedInto ? publicRequestHref(post.mergedInto.slug) : "#"}
                      className="block space-y-2 p-3"
                    >
                      <div className="text-sm font-medium leading-snug text-foreground">
                        {post.mergedInto?.title || "Merged request"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <StatusIcon status={post.mergedInto?.roadmapStatus || "pending"} className="size-4" />
                        <span className="capitalize">{post.mergedInto?.roadmapStatus || "Open"}</span>
                        {post.mergedInto?.boardName ? (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                            {post.mergedInto.boardName}
                          </span>
                        ) : null}
                        <span>{relativeTime(post.mergedInto?.mergedAt || post.createdAt)}</span>
                      </div>
                    </Link>
                  </div>
                ) : null}
                {post.mergedSources && post.mergedSources.length > 0 ? (
                  <div className="rounded-lg border border-border bg-background p-3">
                    <div className="space-y-2.5">
                      {post.mergedSources.map((src) => (
                        <Link
                          key={src.id}
                          href={publicRequestHref(src.slug)}
                          className="block space-y-2"
                        >
                          <div className="text-sm font-medium leading-snug text-foreground">{src.title}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <StatusIcon status={src.roadmapStatus || "pending"} className="size-4" />
                            <span className="capitalize">{src.roadmapStatus || "Open"}</span>
                            {src.boardName ? (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                                {src.boardName}
                              </span>
                            ) : null}
                            <span>{relativeTime(src.mergedAt || post.createdAt)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
      <PoweredBy />
    </aside>
  )
}

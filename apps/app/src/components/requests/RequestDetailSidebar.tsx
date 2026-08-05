"use client"

import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar"
import { getDisplayUser, getInitials } from "@/utils/user"
import { relativeTime } from "@/lib/time"
import StatusIcon from "./StatusIcon"
import RoleBadge from "../global/RoleBadge"
import type { RequestDetailData } from "@/types/request"
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip"
import { CircleQuestionMarkIcon } from "@featul/ui/icons/circle-question-mark"

export type RequestDetailSidebarProps = {
  post: RequestDetailData
  workspaceSlug: string
}

export default function RequestDetailSidebar({
  post,
  workspaceSlug,
}: RequestDetailSidebarProps) {
  const displayAuthor = getDisplayUser(
    post.author
      ? {
          name: post.author.name ?? undefined,
          image: post.author.image ?? undefined,
          email: post.author.email ?? undefined,
        }
      : undefined,
  )
  const authorInitials = getInitials(displayAuthor.name)
  const timeLabel = relativeTime(post.publishedAt ?? post.createdAt)
  const hasMerge =
    Boolean(post.duplicateOfId) || Boolean(post.mergedSources && post.mergedSources.length > 0)

  return (
    <aside className="hidden md:block md:self-start">
      <div className="px-4 py-4 md:px-6 md:py-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative">
            <Avatar className="relative size-10 overflow-visible">
              {displayAuthor.image ? (
                <AvatarImage
                  src={displayAuthor.image}
                  alt={displayAuthor.name}
                  className={displayAuthor.image?.includes("data:image/svg+xml") ? "p-1" : ""}
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
            <span className="text-sm font-semibold text-foreground">{displayAuthor.name}</span>
            <span className="text-xs text-muted-foreground">{timeLabel}</span>
          </div>
        </div>

        {hasMerge ? (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span>Merged requests</span>
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

            {post.duplicateOfId ? (
              <div className="rounded-lg border border-border bg-background">
                <Link
                  href={
                    post.mergedInto
                      ? `/workspaces/${workspaceSlug}/requests/${post.mergedInto.slug}`
                      : "#"
                  }
                  className="block space-y-2 p-3"
                >
                  <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Merged into
                  </div>
                  <div className="text-sm font-medium leading-snug text-foreground">
                    {post.mergedInto?.title || "Merged request"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusIcon
                      status={post.mergedInto?.roadmapStatus || "pending"}
                      className="size-4"
                    />
                    <span className="capitalize">
                      {post.mergedInto?.roadmapStatus || "Open"}
                    </span>
                    {post.mergedInto?.boardName ? (
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        {post.mergedInto.boardName}
                      </span>
                    ) : null}
                    <span>{relativeTime(post.mergedInto?.mergedAt || post.createdAt)}</span>
                  </div>
                </Link>
              </div>
            ) : null}

            {post.mergedSources && post.mergedSources.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                {post.mergedSources.map((src) => (
                  <Link
                    key={src.id}
                    href={`/workspaces/${workspaceSlug}/requests/${src.slug}`}
                    className="block space-y-2"
                  >
                    <div className="text-sm font-medium leading-snug text-foreground">
                      {src.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <StatusIcon status={src.roadmapStatus || "pending"} className="size-4" />
                      <span className="capitalize">{src.roadmapStatus || "Open"}</span>
                      {src.boardName ? (
                        <span className="rounded bg-muted px-1.5 py-0.5">{src.boardName}</span>
                      ) : null}
                      <span>{relativeTime(src.mergedAt || post.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  )
}

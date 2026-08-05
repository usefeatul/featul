"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar"
import { getDisplayUser, getInitials } from "@/utils/user"
import { relativeTime } from "@/lib/time"
import RoleBadge from "../global/RoleBadge"
import RequestProperties from "./RequestProperties"
import type { RequestDetailData } from "@/types/request"
import type { TagSummary } from "@/types/post"
import type {
  RequestDetailBoardState,
  RequestDetailMetaState,
} from "@/hooks/useRequestDetailMeta"
import { cn } from "@featul/ui/lib/utils"

export type RequestDetailSidebarProps = {
  post: RequestDetailData
  workspaceSlug: string
  readonly?: boolean
  meta: RequestDetailMetaState
  onMetaChange: (value: Partial<RequestDetailMetaState>) => void
  board: RequestDetailBoardState
  onBoardChange: (value: RequestDetailBoardState) => void
  tags: TagSummary[]
  onTagsChange: (value: TagSummary[]) => void
  className?: string
  hideOnMobile?: boolean
}

export function RequestAuthorHeader({ post }: { post: RequestDetailData }) {
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

  return (
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
  )
}

export default function RequestDetailSidebar({
  post,
  workspaceSlug,
  readonly,
  meta,
  onMetaChange,
  board,
  onBoardChange,
  tags,
  onTagsChange,
  className,
  hideOnMobile = true,
}: RequestDetailSidebarProps) {
  const canEdit = !readonly

  return (
    <aside
      className={cn(
        hideOnMobile && "hidden md:block",
        "md:sticky md:top-24 md:self-start",
        className,
      )}
    >
      <div className="px-4 py-4 md:px-6 md:py-5">
        <RequestAuthorHeader post={post} />
        <RequestProperties
          post={post}
          workspaceSlug={workspaceSlug}
          canEdit={canEdit}
          meta={meta}
          onMetaChange={onMetaChange}
          board={board}
          onBoardChange={onBoardChange}
          tags={tags}
          onTagsChange={onTagsChange}
        />
      </div>
    </aside>
  )
}

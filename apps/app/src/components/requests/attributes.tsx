"use client"

import type { RequestItemData } from "@/types/request"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import { isActivelySnoozed } from "@featul/api/shared/snooze"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import { randomAvatarUrl } from "@/utils/avatar"
import { relativeTime } from "@/lib/time"
import { getRequestStaleDays } from "@/utils/request/stale"
import { getRequestLowInteractionDays } from "@/utils/request/low-interaction"
import { getActiveRequestFlags } from "@/components/global/flag-visuals"
import RoleBadge from "@/components/global/RoleBadge"
import { RequestEngagementChip } from "./RequestItem"
import { requestBadgeClass } from "./styles"
import { StaleMark } from "./StaleIndicator"
import { LowInteractionMark } from "./LowInteractionIndicator"
import { ReportIndicator } from "./ReportIndicator"
import { SnoozeIndicator } from "./SnoozeIndicator"

export default function Attributes({ item }: { item: RequestItemData }) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest"
  const staleDays = getRequestStaleDays(item)
  const lowInteractionDays = getRequestLowInteractionDays(item)
  const flags = getActiveRequestFlags(item)
  const hasIndicators = staleDays != null || lowInteractionDays != null || (item.reportCount || 0) >= 3 || isActivelySnoozed(item.snoozedUntil)

  return (
    <div className="pointer-events-none relative mt-2 space-y-2 pl-6 [&_button]:pointer-events-auto">
      <div className="flex min-h-5 min-w-0 items-center justify-end gap-1.5">
        <span title={item.boardName} className={cn(requestBadgeClass, "min-w-0 max-w-32 shrink justify-start uppercase tracking-wide")}>
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="truncate">{item.boardName}</span>
        </span>
        <RequestEngagementChip postId={item.id} upvotes={item.upvotes} hasVoted={item.hasVoted} commentCount={item.commentCount} showComments />
        {flags.length > 0 ? (
          <div className="flex shrink-0 items-center gap-1">
            {flags.map(({ key, label, Icon, iconClass }) => (
              <span key={key} title={label} aria-label={label} className="pointer-events-auto inline-flex h-5 w-3.5 items-center justify-center">
                <Icon className={cn("size-3.5", iconClass)} />
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {hasIndicators ? (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {staleDays != null ? <StaleMark days={staleDays} /> : null}
          {lowInteractionDays != null ? <LowInteractionMark days={lowInteractionDays} /> : null}
          <ReportIndicator count={item.reportCount || 0} />
          <SnoozeIndicator snoozedUntil={item.snoozedUntil} />
        </div>
      ) : null}
      <div className="pointer-events-none flex items-center gap-2 text-[11px] text-accent">
        <Avatar className="relative size-5 overflow-visible bg-muted">
          <AvatarImage src={item.authorImage || randomAvatarUrl(item.id || item.slug)} alt={author} />
          <AvatarFallback>{getInitials(author)}</AvatarFallback>
          <RoleBadge role={item.role} isOwner={item.isOwner} isFeatul={item.isFeatul} />
        </Avatar>
        <span className="min-w-0 truncate">{author}</span>
        <time className="ml-auto shrink-0" dateTime={item.publishedAt ?? item.createdAt}>{relativeTime(item.publishedAt ?? item.createdAt)}</time>
      </div>
    </div>
  )
}

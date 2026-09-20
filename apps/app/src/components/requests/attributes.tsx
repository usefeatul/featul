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
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { StaleMark } from "./StaleIndicator"
import { LowInteractionMark } from "./LowInteractionIndicator"
import { ReportIndicator } from "./ReportIndicator"
import { SnoozeIndicator } from "./SnoozeIndicator"

export default function Attributes({ item }: { item: RequestItemData }) {
  const author = item.isAnonymous ? "Guest" : item.authorName || "Guest"
  const staleDays = getRequestStaleDays(item)
  const lowInteractionDays = getRequestLowInteractionDays(item)
  const flags = getActiveRequestFlags(item)
  const hasSecondaryIndicators = lowInteractionDays != null || (item.reportCount || 0) >= 3 || isActivelySnoozed(item.snoozedUntil)

  return (
    <div className="pointer-events-none relative mt-1.5 space-y-1.5 [&_button]:pointer-events-auto">
      <div className="flex min-w-0 items-center gap-2 text-[10px] leading-none text-muted-foreground">
        <Avatar className="relative size-6 shrink-0 overflow-visible bg-muted">
          <AvatarImage src={item.authorImage || randomAvatarUrl(item.id || item.slug)} alt={author} />
          <AvatarFallback>{getInitials(author)}</AvatarFallback>
          <RoleBadge role={item.role} isOwner={item.isOwner} isFeatul={item.isFeatul} />
        </Avatar>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span className="max-w-20 truncate font-medium">{author}</span>
          <span aria-hidden className="text-border">·</span>
          <span title={item.boardName} className="inline-flex h-5 min-w-0 max-w-24 items-center gap-1.5 rounded-md bg-muted/70 px-1.5 dark:bg-white/[0.055]">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
            <span className="truncate">{item.boardName}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2 tabular-nums">
          <UpvoteButton
            postId={item.id}
            upvotes={item.upvotes}
            hasVoted={item.hasVoted}
            className="relative z-10 h-5 gap-1 rounded-md bg-muted/70 px-1.5 text-[10px] hover:bg-muted dark:bg-white/[0.055] dark:hover:bg-white/[0.08]"
          />
          {flags.length > 0 ? (
            <span className="flex h-5 items-center gap-1 rounded-md bg-muted/70 px-1.5 dark:bg-white/[0.055]">
            {flags.map(({ key, label, Icon, iconClass }) => (
              <span key={key} title={label} aria-label={label} className="pointer-events-auto inline-flex items-center justify-center">
                <Icon className={cn("size-3", iconClass)} />
              </span>
            ))}
            </span>
          ) : null}
          {staleDays != null ? (
            <StaleMark
              days={staleDays}
              className="h-5 rounded-md bg-muted/70 px-1.5 text-[10px] font-medium tracking-normal text-amber-700 dark:bg-white/[0.055] dark:text-amber-400"
            />
          ) : null}
          <time className="shrink-0 text-muted-foreground/80" dateTime={item.publishedAt ?? item.createdAt}>
            {relativeTime(item.publishedAt ?? item.createdAt)}
          </time>
        </div>
      </div>
      {hasSecondaryIndicators ? (
        <div className="flex flex-wrap items-center gap-1.5 pl-8">
          {lowInteractionDays != null ? <LowInteractionMark days={lowInteractionDays} /> : null}
          <ReportIndicator count={item.reportCount || 0} />
          <SnoozeIndicator snoozedUntil={item.snoozedUntil} />
        </div>
      ) : null}
    </div>
  )
}

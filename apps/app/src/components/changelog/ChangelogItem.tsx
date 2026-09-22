"use client"

import React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar"
import { cn } from "@featul/ui/lib/utils"
import { ChangelogDraftIcon } from "@featul/ui/icons/changelog-draft"
import { ChangelogPublishedIcon } from "@featul/ui/icons/changelog-published"
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data"
import { ChangelogItemContextMenu } from "./ChangelogItemContextMenu"
import { SelectionControl } from "@/components/selection/SelectionControl"
import {
  getSelectableRowClassName,
  type SelectionToggleMeta,
} from "@/components/selection/Row"
import { requestBadgeClass } from "@/components/requests/styles"
import { getInitials } from "@/utils/user"
import { randomAvatarUrl } from "@/utils/avatar"
import { relativeTime } from "@/lib/time"

interface ChangelogItemProps {
  item: ChangelogEntryWithTags
  workspaceSlug: string
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (checked: boolean, meta?: SelectionToggleMeta) => void
}

function ChangelogItem({
  item,
  workspaceSlug,
  isSelecting,
  isSelected,
  onToggle,
}: ChangelogItemProps) {
  const authorName = item.authorName || "Guest"
  const displayDate = item.publishedAt || item.createdAt
  const isSelectingMode = Boolean(isSelecting)
  const isSelectedMode = Boolean(isSelected)
  const href = `/workspaces/${workspaceSlug}/changelog/${item.id}/edit`
  const visibleTags = item.tags.slice(0, 2)
  const extraTagCount = Math.max(0, item.tags.length - visibleTags.length)
  const dateLabel = relativeTime(new Date(displayDate).toISOString())

  const handleRowClick: React.MouseEventHandler<HTMLDivElement> =
    React.useCallback(
      (event) => {
        if (!isSelectingMode) return
        event.preventDefault()
        event.stopPropagation()
        onToggle?.(!isSelectedMode, { shiftKey: event.shiftKey })
      },
      [isSelectingMode, isSelectedMode, onToggle],
    )

  const rowClassName = getSelectableRowClassName(
    isSelectingMode,
    isSelectedMode,
    "group/changelog relative flex min-h-10 items-center gap-3 overflow-hidden px-4 py-1.5 sm:px-6",
    "hover:bg-muted/50 dark:hover:bg-white/[0.04]",
  )

  return (
    <li className="list-none">
      <ChangelogItemContextMenu
        item={item}
        workspaceSlug={workspaceSlug}
        onClick={handleRowClick}
      >
        <div className={rowClassName}>
          {isSelectingMode ? (
            <SelectionControl
              checked={isSelectedMode}
              label={isSelectedMode ? "Deselect entry" : "Select entry"}
              onCheckedChange={(value) => onToggle?.(value)}
              onClick={(event) => event.stopPropagation()}
            />
          ) : (
            <Link
              href={href}
              className="absolute inset-0 z-0"
              aria-label={item.title}
            />
          )}

          <span
            className="shrink-0"
            title={item.status === "published" ? "Published" : "Draft"}
          >
            {item.status === "published" ? (
              <ChangelogPublishedIcon className="size-4" />
            ) : (
              <ChangelogDraftIcon className="size-4" />
            )}
          </span>

          <span className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-foreground">
            {item.title}
          </span>

          <div
            className={cn(
              "pointer-events-none flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground lg:gap-3",
            )}
          >
            {visibleTags.length > 0 ? (
              <div className="hidden items-center gap-1.5 xl:flex">
                {visibleTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={cn(
                      requestBadgeClass,
                      "max-w-28 uppercase tracking-[0.06em]",
                    )}
                    title={tag.name}
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-primary"
                      style={
                        tag.color ? { backgroundColor: tag.color } : undefined
                      }
                      aria-hidden
                    />
                    <span className="truncate">{tag.name}</span>
                  </span>
                ))}
                {extraTagCount > 0 ? (
                  <span className={cn(requestBadgeClass, "tabular-nums")}>
                    +{extraTagCount}
                  </span>
                ) : null}
              </div>
            ) : null}

            <span className="hidden w-12 text-right text-[10px] tabular-nums sm:inline">
              {dateLabel}
            </span>
            <Avatar className="relative size-6 overflow-visible bg-muted">
              <AvatarImage
                src={item.authorImage || randomAvatarUrl(item.authorId)}
                alt={authorName}
              />
              <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </ChangelogItemContextMenu>
    </li>
  )
}

export default React.memo(ChangelogItem)

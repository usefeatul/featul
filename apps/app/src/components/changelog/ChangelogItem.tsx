"use client"

import React from "react"
import Link from "next/link"

import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { Checkbox } from "@featul/ui/components/checkbox"
import { cn } from "@featul/ui/lib/utils"
import { getInitials } from "@/utils/user"
import { randomAvatarUrl } from "@/utils/avatar"
import { ChangelogDraftIcon } from "@featul/ui/icons/changelog-draft"
import { ChangelogPublishedIcon } from "@featul/ui/icons/changelog-published"
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data"
import { ChangelogItemContextMenu } from "./ChangelogItemContextMenu"

interface ChangelogItemProps {
    item: ChangelogEntryWithTags
    workspaceSlug: string
    isSelecting?: boolean
    isSelected?: boolean
    onToggle?: (checked: boolean) => void
}

function ChangelogItem({ item, workspaceSlug, isSelecting, isSelected, onToggle }: ChangelogItemProps) {
    const authorName = item.authorName || "Guest"
    const publishedDate = item.publishedAt ? new Date(item.publishedAt) : null
    const createdDate = new Date(item.createdAt)
    const displayDate = publishedDate || createdDate
    const isSelectingMode = Boolean(isSelecting)
    const isSelectedMode = Boolean(isSelected)
    const handleRowClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback((e) => {
        if (!isSelectingMode) return
        e.preventDefault()
        e.stopPropagation()
        onToggle?.(!isSelectedMode)
    }, [isSelectingMode, isSelectedMode, onToggle])
    const rowClassName = cn(
        "flex items-center gap-3 px-4 py-3 border-b border-border/70 bg-card dark:bg-black/40",
        isSelectingMode ? "cursor-pointer" : "hover:bg-background dark:hover:bg-background transition-colors"
    )

    return (
        <ChangelogItemContextMenu item={item} workspaceSlug={workspaceSlug} onClick={handleRowClick}>
            <div className={rowClassName}>
                {isSelectingMode && (
                    <Checkbox
                        checked={isSelectedMode}
                        onCheckedChange={(v) => onToggle?.(Boolean(v))}
                        onClick={(e) => e.stopPropagation()}
                        className="mr-1 cursor-pointer border-border dark:border-border data-[state=checked]:border-primary"
                    />
                )}
                <Link
                    href={`/workspaces/${workspaceSlug}/changelog/${item.id}/edit`}
                    className={cn(
                        "flex items-center gap-3 flex-1 min-w-0",
                        isSelectingMode && "pointer-events-none"
                    )}
                    tabIndex={isSelectingMode ? -1 : 0}
                    aria-disabled={isSelectingMode ? true : undefined}
                >
                    <div className="shrink-0">
                        {item.status === "published" ? (
                            <ChangelogPublishedIcon className="size-6" />
                        ) : (
                            <ChangelogDraftIcon className="size-6" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">{item.title}</h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(displayDate)}</span>
                        <div className="relative">
                            <Avatar className="size-6 bg-muted ring-1 ring-border relative overflow-visible">
                                <AvatarImage src={item.authorImage || randomAvatarUrl(item.authorId)} alt={authorName} />
                                <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </Link>
            </div>
        </ChangelogItemContextMenu>
    )
}

export default React.memo(ChangelogItem)

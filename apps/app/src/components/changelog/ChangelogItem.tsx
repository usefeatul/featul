"use client"

import React from "react"
import Link from "next/link"

import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { randomAvatarUrl } from "@/utils/avatar"
import { ChangelogDraftIcon } from "@featul/ui/icons/changelog-draft"
import { ChangelogPublishedIcon } from "@featul/ui/icons/changelog-published"
import type { ChangelogEntryWithTags } from "@/app/(main)/workspaces/[slug]/changelog/data"
import { ChangelogItemContextMenu } from "./ChangelogItemContextMenu"

interface ChangelogItemProps {
    item: ChangelogEntryWithTags
    workspaceSlug: string
}

function ChangelogItem({ item, workspaceSlug }: ChangelogItemProps) {
    const authorName = item.authorName || "Guest"
    const publishedDate = item.publishedAt ? new Date(item.publishedAt) : null
    const createdDate = new Date(item.createdAt)
    const displayDate = publishedDate || createdDate

    return (
        <ChangelogItemContextMenu item={item} workspaceSlug={workspaceSlug}>
            <Link
                href={`/workspaces/${workspaceSlug}/changelog/${item.id}/edit`}
                className="flex items-center gap-3 px-4 py-3 border-b border-border/70 bg-card dark:bg-black/40 hover:bg-muted/50 transition-colors"
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
        </ChangelogItemContextMenu>
    )
}

export default React.memo(ChangelogItem)


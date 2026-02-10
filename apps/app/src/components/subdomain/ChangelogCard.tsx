"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user-utils";

import RoleBadge from "@/components/global/RoleBadge";
import type { ChangelogEntry } from "@/types/changelog";
import { extractTextFromTiptap } from "@/types/changelog";
import { subdomainListItemClassName } from "./subdomainListItemStyles";

export interface ChangelogCardProps {
    item: ChangelogEntry;
    linkPrefix?: string;
}

export function ChangelogCard({ item, linkPrefix = "/p" }: ChangelogCardProps) {
    const href = `${linkPrefix}/${item.slug}`;
    const displayName = item.author?.name || "Unknown";
    const displayImage = item.author?.image || undefined;

    // Use summary if available, otherwise extract text from content
    const previewText = item.summary || extractTextFromTiptap(item.content);

    return (
        <div className={`${subdomainListItemClassName} relative group`}>
            <Link href={href} className="absolute inset-0 focus:outline-none" aria-label={item.title}>
                <span className="sr-only">View changelog</span>
            </Link>

            {/* Cover image at top if available */}
            {item.coverImage ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4">
                    <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : null}

            {/* Title */}
            <div className="mt-2">
                <h3 className="text-lg font-semibold text-foreground">
                    {item.title}
                </h3>
            </div>

            {/* Content preview */}
            {previewText ? (
                <p className="mt-3 text-sm text-accent whitespace-normal line-clamp-2">{previewText}</p>
            ) : null}

            {/* Author and date */}
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Avatar className="size-8 relative overflow-visible">
                            <AvatarImage src={displayImage} alt={displayName} />
                            <AvatarFallback className="text-xs bg-muted text-muted-foreground">{getInitials(displayName)}</AvatarFallback>
                            <RoleBadge
                                role={item.author?.role}
                                isOwner={item.author?.isOwner}
                                className="bg-card"
                            />
                        </Avatar>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground whitespace-nowrap max-w-[180px] truncate">
                            {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground leading-tight">
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }) : ""}
                        </span>
                    </div>
                </div>

                {/* Tags on the right side */}
                {item.tags && item.tags.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                        {item.tags.slice(0, 3).map((tag) => (
                            <span key={tag.id} className="text-xs rounded-md bg-muted px-2 py-0.5 text-accent">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}



export default React.memo(ChangelogCard);

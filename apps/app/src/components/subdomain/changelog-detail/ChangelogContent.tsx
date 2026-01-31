import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user-utils";
import { ChangelogRenderer } from "@/components/changelog/ChangelogRenderer";
import RoleBadge from "@/components/global/RoleBadge";
import type { Role } from "@/types/team";

export interface ChangelogEntryData {
    id: string;
    title: string;
    slug: string;
    content?: unknown;
    summary?: string | null;
    coverImage?: string | null;
    publishedAt?: string | Date | null;
    author?: {
        name?: string | null;
        image?: string | null;
        role?: Role | null;
        isOwner?: boolean;
    };
    tags?: Array<{ id: string; name: string }>;
}

interface ChangelogContentProps {
    entry: ChangelogEntryData;
}

export function ChangelogContent({ entry }: ChangelogContentProps) {
    const displayName = entry.author?.name || "Unknown";
    const displayImage = entry.author?.image || undefined;

    return (
        <div className="rounded-lg border bg-card p-6 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
            {/* Cover Image */}
            {entry.coverImage ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-6">
                    <img
                        src={entry.coverImage}
                        alt={entry.title}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : null}

            {/* Title */}
            <h1 className="text-xl font-semibold text-foreground mb-4">
                {entry.title}
            </h1>

            {/* Author & Date */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                    <Avatar className="size-8 relative overflow-visible">
                        <AvatarImage src={displayImage} alt={displayName} />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {getInitials(displayName)}
                        </AvatarFallback>
                        <RoleBadge
                            role={entry.author?.role}
                            isOwner={entry.author?.isOwner}
                            className="bg-card"
                        />
                    </Avatar>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-medium text-foreground">
                        {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {entry.publishedAt
                            ? new Date(entry.publishedAt).toLocaleDateString(undefined, {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })
                            : ""}
                    </span>
                </div>
            </div>

            {/* Content */}
            {entry.content ? (
                <div className="prose dark:prose-invert max-w-none">
                    <ChangelogRenderer content={entry.content} />
                </div>
            ) : null}

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 ? (
                <div className="pt-4 mt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                            <span
                                key={tag.id}
                                className="text-xs rounded-md bg-muted px-2 py-1 text-muted-foreground font-medium"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

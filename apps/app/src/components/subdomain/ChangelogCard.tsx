"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user-utils";
import { relativeTime } from "@/lib/time";
import RoleBadge from "@/components/global/RoleBadge";
import type { Role } from "@/types/team";

function toPlainText(content: any): string {
    if (!content) return "";
    if (typeof content === "string") {
        return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
    // Handle TipTap JSON content - extract text from nodes
    if (typeof content === "object" && content.content) {
        const extractText = (node: any): string => {
            if (node.text) return node.text;
            if (node.content && Array.isArray(node.content)) {
                return node.content.map(extractText).join(" ");
            }
            return "";
        };
        return extractText(content).replace(/\s+/g, " ").trim();
    }
    return "";
}

export interface ChangelogCardProps {
    item: {
        id: string;
        title: string;
        slug: string;
        summary?: string | null;
        content?: any;
        coverImage?: string | null;
        publishedAt?: Date | string | null;
        author?: {
            name?: string | null;
            image?: string | null;
            role?: Role | null;
            isOwner?: boolean;
        };
        tags?: Array<{ id: string; name: string }>;
    };
    linkPrefix?: string;
}

export function ChangelogCard({ item, linkPrefix = "/p" }: ChangelogCardProps) {
    const href = `${linkPrefix}/${item.slug}`;
    const displayName = item.author?.name || "Unknown";
    const displayImage = item.author?.image || undefined;

    // Use summary if available, otherwise extract text from content
    const previewText = item.summary || toPlainText(item.content);

    return (
        <div className="py-6 px-6 relative group">
            <Link href={href} className="absolute inset-0 focus:outline-none" aria-label={item.title}>
                <span className="sr-only">View changelog</span>
            </Link>

            {/* Cover image at top if available */}
            {item.coverImage ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted mb-4">
                    <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            ) : null}

            {/* Title */}
            <div className="mt-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
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
                            {relativeTime(typeof item.publishedAt === 'string' ? item.publishedAt : item.publishedAt instanceof Date ? item.publishedAt.toISOString() : "")}
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

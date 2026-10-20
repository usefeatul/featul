"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user";
import RoleBadge from "@/components/global/RoleBadge";
import type { ChangelogEntry } from "@/types/changelog";
import { extractTextFromTiptap } from "@/types/changelog";
import { ArrowRight } from "@/components/global/icons";

export interface ChangelogCardProps {
    item: ChangelogEntry;
    linkPrefix?: string;
}

function formatDate(value?: string | Date | null) {
    if (!value) return { short: "", full: "" };
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return { short: "", full: "" };
    return {
        short: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        full: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
}

/** Changelog entry: sticky date column on the left, plain entry on the right. */
export function ChangelogCard({ item, linkPrefix = "/p" }: ChangelogCardProps) {
    const href = `${linkPrefix}/${item.slug}`;
    const displayName = item.author?.name || "Unknown";
    const displayImage = item.author?.image || undefined;
    const previewText = item.summary || extractTextFromTiptap(item.content);
    const date = formatDate(item.publishedAt);

    return (
        <article className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-10">
            {/* Date column stays in view while a long entry scrolls past. */}
            <div className="sm:sticky sm:top-24 sm:self-start sm:pt-1">
                <time
                    dateTime={item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined}
                    className="text-sm text-muted-foreground"
                >
                    {date.full}
                </time>
            </div>

            <div className="group relative min-w-0">
                <Link href={href} className="absolute inset-0 z-10 focus:outline-none" aria-label={item.title}>
                    <span className="sr-only">View changelog</span>
                </Link>

                <h3 className="text-xl font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                    {item.title}
                </h3>

                {item.tags && item.tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {item.tags.slice(0, 4).map((tag) => (
                            <span
                                key={tag.id}
                                className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground dark:bg-white/[0.06]"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                ) : null}

                {item.coverImage ? (
                    <div className="mt-5 aspect-[2/1] w-full overflow-hidden rounded-lg bg-muted">
                        <img
                            src={item.coverImage}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                    </div>
                ) : null}

                {previewText ? (
                    <p className="mt-4 line-clamp-3 text-[15px] leading-7 text-accent">{previewText}</p>
                ) : null}

                <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="relative size-5 overflow-visible">
                            <AvatarImage src={displayImage} alt={displayName} />
                            <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">{getInitials(displayName)}</AvatarFallback>
                            <RoleBadge role={item.author?.role} isOwner={item.author?.isOwner} className="bg-background" />
                        </Avatar>
                        <span className="truncate text-sm text-muted-foreground">{displayName}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors group-hover:text-primary">
                        Read more
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                </div>
            </div>
        </article>
    );
}

export default React.memo(ChangelogCard);

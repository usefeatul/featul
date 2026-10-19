"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user";
import RoleBadge from "@/components/global/RoleBadge";
import type { ChangelogEntry } from "@/types/changelog";
import { extractTextFromTiptap } from "@/types/changelog";
import { ArrowRight } from "@/components/global/icons";
import { cn } from "@featul/ui/lib/utils";

export interface ChangelogCardProps {
    item: ChangelogEntry;
    linkPrefix?: string;
    /** Last entry in the feed: stop the timeline line at the dot. */
    isLast?: boolean;
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

/** Timeline entry: date rail on the left, content card on the right. */
export function ChangelogCard({ item, linkPrefix = "/p", isLast = false }: ChangelogCardProps) {
    const href = `${linkPrefix}/${item.slug}`;
    const displayName = item.author?.name || "Unknown";
    const displayImage = item.author?.image || undefined;
    const previewText = item.summary || extractTextFromTiptap(item.content);
    const date = formatDate(item.publishedAt);

    return (
        <article className="relative grid gap-3 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-6">
            {/* Date rail */}
            <div className="relative flex items-start gap-3 sm:block sm:pt-1.5">
                <time
                    dateTime={item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined}
                    title={date.full}
                    className="text-xs font-medium tabular-nums text-muted-foreground sm:text-sm"
                >
                    {date.short}
                </time>
            </div>

            {/* Timeline dot + line segment (desktop); the gap between date and card is 24px wide. */}
            <span
                aria-hidden
                className="absolute top-2.5 left-[111px] z-10 hidden size-2.5 rounded-full bg-primary ring-4 ring-background sm:block"
            />
            <span
                aria-hidden
                className={cn(
                    "absolute top-2.5 left-[115.5px] hidden w-px bg-border sm:block dark:bg-white/[0.1]",
                    isLast ? "h-5" : "-bottom-8",
                )}
            />

            {/* Content */}
            <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-primary/40 dark:border-white/[0.07]">
                <Link href={href} className="absolute inset-0 focus:outline-none" aria-label={item.title}>
                    <span className="sr-only">View changelog</span>
                </Link>

                {item.coverImage ? (
                    <div className="aspect-[2/1] w-full overflow-hidden border-b border-border/60 bg-muted dark:border-white/[0.06]">
                        <img
                            src={item.coverImage}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    </div>
                ) : null}

                <div className="p-5">
                    {item.tags && item.tags.length > 0 ? (
                        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                            {item.tags.slice(0, 4).map((tag) => (
                                <span
                                    key={tag.id}
                                    className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/15"
                                >
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary sm:text-xl">
                        {item.title}
                    </h3>

                    {previewText ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{previewText}</p>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                            <Avatar className="relative size-6 overflow-visible">
                                <AvatarImage src={displayImage} alt={displayName} />
                                <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">{getInitials(displayName)}</AvatarFallback>
                                <RoleBadge role={item.author?.role} isOwner={item.author?.isOwner} className="bg-card" />
                            </Avatar>
                            <span className="truncate text-xs font-medium text-foreground/80">{displayName}</span>
                            <span className="text-xs text-muted-foreground/70 sm:hidden">· {date.full}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                            Read more
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default React.memo(ChangelogCard);

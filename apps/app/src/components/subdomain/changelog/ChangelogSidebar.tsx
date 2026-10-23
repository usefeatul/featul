"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { Copy, ShareIcon } from "@/components/global/icons";
import RoleBadge from "@/components/global/RoleBadge";
import { getInitials } from "@/utils/user";
import type { ChangelogEntryAuthor } from "./ChangelogContent";
import { ShareIdeaButton } from "../ShareIdeaButton";
import { DetailRow, SidebarActionItem, SidebarSection } from "../SidebarSection";
import { copyPostLink, sharePostLink } from "../request/actions/RequestShareAction";

interface ChangelogSidebarProps {
    title: string;
    author?: ChangelogEntryAuthor;
    authors?: ChangelogEntryAuthor[];
    publishedAt?: string | Date | null;
}

/** Public author label. Owner is Founder; member/viewer both "Team Member". */
function getRoleLabel(role?: ChangelogEntryAuthor["role"], isOwner?: boolean): string {
    if (isOwner) return "Founder";
    if (role === "admin") return "Admin";
    if (role === "member" || role === "viewer") return "Team Member";
    return "Author";
}

function formatPublished(value?: string | Date | null) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function AuthorChip({ author }: { author?: ChangelogEntryAuthor }) {
    const displayName = author?.name || "Unknown";
    return (
        <span className="inline-flex min-w-0 items-center gap-2">
            <Avatar className="relative size-6 shrink-0 overflow-visible">
                <AvatarImage src={author?.image || undefined} alt={displayName} />
                <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                    {getInitials(displayName)}
                </AvatarFallback>
                <RoleBadge role={author?.role} isOwner={author?.isOwner} />
            </Avatar>
            <span className="truncate">{displayName}</span>
        </span>
    );
}

/** Changelog detail rail: share CTA, entry details, and link actions. */
export function ChangelogSidebar({ title, author, authors, publishedAt }: ChangelogSidebarProps) {
    const published = formatPublished(publishedAt);
    const credited = authors && authors.length > 0 ? authors : [author];

    return (
        <aside className="hidden min-w-0 md:block md:self-stretch md:pt-1">
            <div className="space-y-6 md:sticky md:top-20">
                <ShareIdeaButton className="w-full" />

                <SidebarSection title="Details">
                    <dl className="space-y-0.5">
                        {credited.length > 1 ? (
                            <DetailRow label="Authors" alignTop>
                                <span className="flex min-w-0 flex-col items-end gap-1.5 py-0.5">
                                    {credited.map((item, index) => (
                                        <AuthorChip key={`${item?.name ?? "author"}-${index}`} author={item} />
                                    ))}
                                </span>
                            </DetailRow>
                        ) : (
                            <>
                                <DetailRow label="Author">
                                    <AuthorChip author={credited[0]} />
                                </DetailRow>
                                <DetailRow label="Role">{getRoleLabel(credited[0]?.role, credited[0]?.isOwner)}</DetailRow>
                            </>
                        )}
                        {published ? <DetailRow label="Published">{published}</DetailRow> : null}
                    </dl>
                </SidebarSection>

                <SidebarSection title="Actions">
                    <ul className="space-y-0.5">
                        <SidebarActionItem icon={<Copy className="size-4" />} label="Copy link" onClick={() => copyPostLink()} />
                        <SidebarActionItem
                            icon={<ShareIcon className="size-4" />}
                            label="Share"
                            onClick={() => sharePostLink(undefined, title)}
                        />
                    </ul>
                </SidebarSection>
            </div>
        </aside>
    );
}

"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { Copy, ShareIcon } from "@/components/global/icons";
import { getInitials } from "@/utils/user";
import type { Role } from "@/types/team";
import { ShareIdeaButton } from "../ShareIdeaButton";
import { DetailRow, SidebarActionItem, SidebarSection } from "../SidebarSection";
import { copyPostLink, sharePostLink } from "../request/actions/RequestShareAction";

interface ChangelogSidebarProps {
    title: string;
    author?: {
        name?: string | null;
        image?: string | null;
        role?: Role | null;
        isOwner?: boolean;
    };
    publishedAt?: string | Date | null;
}

/** Public author label. Owner is Founder; member/viewer both "Team Member". */
function getRoleLabel(role?: Role | null, isOwner?: boolean): string {
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

/** Changelog detail rail: share CTA, entry details, and link actions. */
export function ChangelogSidebar({ title, author, publishedAt }: ChangelogSidebarProps) {
    const displayName = author?.name || "Unknown";
    const published = formatPublished(publishedAt);

    return (
        <aside className="hidden min-w-0 md:block md:pt-1">
            <div className="space-y-6 md:sticky md:top-20">
                <ShareIdeaButton className="w-full" />

                <SidebarSection title="Details">
                    <dl className="space-y-0.5">
                        <DetailRow label="Author">
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                                <Avatar className="size-5 shrink-0">
                                    <AvatarImage src={author?.image || undefined} alt={displayName} />
                                    <AvatarFallback className="bg-muted text-[9px] text-muted-foreground">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{displayName}</span>
                            </span>
                        </DetailRow>
                        <DetailRow label="Role">{getRoleLabel(author?.role, author?.isOwner)}</DetailRow>
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

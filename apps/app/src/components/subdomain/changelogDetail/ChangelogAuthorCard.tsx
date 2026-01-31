"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user-utils";
import RoleBadge from "@/components/global/RoleBadge";
import type { Role } from "@/types/team";

interface ChangelogAuthorCardProps {
    author?: {
        name?: string | null;
        image?: string | null;
        role?: Role | null;
        isOwner?: boolean;
    };
}

function getRoleLabel(role?: Role | null, isOwner?: boolean): string {
    if (isOwner) return "Founder";
    if (role === "admin") return "Admin";
    if (role === "member") return "Team Member";
    if (role === "viewer") return "Team Member";
    return "Author";
}

export function ChangelogAuthorCard({ author }: ChangelogAuthorCardProps) {
    const displayName = author?.name || "Unknown";
    const displayImage = author?.image || undefined;
    const roleLabel = getRoleLabel(author?.role, author?.isOwner);

    return (
        <div className="rounded-xl bg-card p-4 border ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Avatar className="size-10 relative overflow-visible">
                        <AvatarImage src={displayImage} alt={displayName} />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {getInitials(displayName)}
                        </AvatarFallback>
                        <RoleBadge
                            role={author?.role}
                            isOwner={author?.isOwner}
                            className="-bottom-1 -right-0.5"
                        />
                    </Avatar>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{displayName}</span>
                    <span className="text-xs text-muted-foreground">{roleLabel}</span>
                </div>
            </div>
        </div>
    );
}

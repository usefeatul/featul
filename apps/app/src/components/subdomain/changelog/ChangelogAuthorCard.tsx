"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@featul/ui/components/avatar";
import { getInitials } from "@/utils/user";
import RoleBadge from "@/components/global/RoleBadge";
import type { Role } from "@/types/team";
import {
    settingsCardInnerClass,
    settingsCardShellClass,
} from "@/components/settings/global/SectionCard";

interface ChangelogAuthorCardProps {
    author?: {
        name?: string | null;
        image?: string | null;
        role?: Role | null;
        isOwner?: boolean;
    };
    publishedAt?: string | Date | null;
}

function getRoleLabel(role?: Role | null, isOwner?: boolean): string {
    if (isOwner) return "Founder";
    if (role === "admin") return "Admin";
    if (role === "member") return "Team Member";
    if (role === "viewer") return "Team Member";
    return "Author";
}

export function ChangelogAuthorCard({ author, publishedAt }: ChangelogAuthorCardProps) {
    const displayName = author?.name || "Unknown";
    const displayImage = author?.image || undefined;
    const roleLabel = getRoleLabel(author?.role, author?.isOwner);

    return (
        <div className={settingsCardShellClass}>
            <header className="flex items-center gap-3 py-2">
                <div className="relative">
                    <Avatar className="size-8 relative overflow-visible">
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
                <span className="truncate text-sm font-medium leading-none text-foreground">
                    {displayName}
                </span>
            </header>
            <div className={settingsCardInnerClass}>
                <p className="text-sm text-foreground">{roleLabel}</p>
                {publishedAt ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(publishedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { Button } from "@featul/ui/components/button";
import { Lightbulb } from "lucide-react";
import CreatePostModal from "../CreatePostModal";
import { ChangelogAuthorCard } from "./ChangelogAuthorCard";
import { PoweredBy } from "../PoweredBy";
import type { Role } from "@/types/team";

interface ChangelogSidebarProps {
    subdomain: string;
    author?: {
        name?: string | null;
        image?: string | null;
        role?: Role | null;
        isOwner?: boolean;
    };
}

export function ChangelogSidebar({ subdomain, author }: ChangelogSidebarProps) {
    const [open, setOpen] = useState(false);

    return (
        <aside className="hidden md:block space-y-4">
            {/* Got an idea card */}
            <div className="rounded-xl bg-card p-4 border ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Got an idea?</span>
                </div>
                <Button
                    onClick={() => setOpen(true)}
                    className="w-full h-9 bg-primary hover:bg-primary/90"
                >
                    Submit a Post
                </Button>
            </div>

            {/* Author Card */}
            <ChangelogAuthorCard author={author} />

            {/* Powered By */}
            <PoweredBy />

            <CreatePostModal
                open={open}
                onOpenChange={setOpen}
                workspaceSlug={subdomain}
                boardSlug={subdomain}
            />
        </aside>
    );
}

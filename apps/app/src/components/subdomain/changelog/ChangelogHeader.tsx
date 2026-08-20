import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@featul/ui/components/button";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";

interface ChangelogHeaderProps {
    sidebarPosition: "left" | "right";
    backLink?: string;
}

export function ChangelogHeader({ sidebarPosition, backLink = "/changelog" }: ChangelogHeaderProps) {
    return (
        <div
            className={
                sidebarPosition === "left"
                    ? "grid md:grid-cols-[0.3fr_0.7fr] gap-6 mb-6"
                    : "grid md:grid-cols-[0.7fr_0.3fr] gap-6 mb-6"
            }
        >
            {/* Left Spacer for Sidebar */}
            {sidebarPosition === "left" ? (
                <div className="hidden md:block" />
            ) : null}

            {/* Header Content */}
            <div
                className={`flex items-center gap-3 ${sidebarPosition === "left" ? "justify-end" : ""}`}
            >
                <Toolbar size="sm" className="w-fit">
                    <Button variant="plain" size="icon" asChild className={cn(toolbarItemClass, "px-2.5")}>
                        <Link href={backLink} aria-label="Back to changelog">
                            <ChevronLeft className="size-4" />
                        </Link>
                    </Button>
                </Toolbar>
                <h1 className="text-xl font-semibold text-foreground">Changelog</h1>
            </div>

            {/* Right Spacer for Sidebar */}
            {sidebarPosition === "right" ? (
                <div className="hidden md:block" />
            ) : null}
        </div>
    );
}

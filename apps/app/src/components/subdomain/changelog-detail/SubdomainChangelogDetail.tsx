"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@featul/ui/components/button";
import { useDomainBranding } from "../DomainBrandingProvider";
import { ChangelogContent, type ChangelogEntryData } from "./ChangelogContent";
import { ChangelogSidebar } from "./ChangelogSidebar";

interface ChangelogHeaderProps {
    sidebarPosition: "left" | "right";
    backLink: string;
}

function ChangelogHeader({ sidebarPosition, backLink }: ChangelogHeaderProps) {
    return (
        <div
            className={
                sidebarPosition === "left"
                    ? "grid md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] gap-6 mb-6 md:justify-items-stretch"
                    : "grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)] gap-6 mb-6 md:justify-items-stretch"
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
                <Button variant="nav" size="icon" asChild>
                    <Link href={backLink} aria-label="Back to changelog">
                        <ChevronLeft className="size-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold text-foreground">Changelog</h1>
            </div>

            {/* Right Spacer for Sidebar */}
            {sidebarPosition === "right" ? (
                <div className="hidden md:block" />
            ) : null}
        </div>
    );
}

export default function SubdomainChangelogDetail({
    entry,
    subdomain,
    backLink = "/changelog",
}: {
    entry: ChangelogEntryData;
    subdomain: string;
    backLink?: string;
}) {
    const { sidebarPosition = "right" } = useDomainBranding();

    return (
        <section className="mt-4 md:mt-6 mb-12">
            <ChangelogHeader sidebarPosition={sidebarPosition} backLink={backLink} />

            {/* Main Content Grid */}
            <div
                className={
                    sidebarPosition === "left"
                        ? "grid md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] gap-6 items-start md:justify-items-stretch"
                        : "grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)] gap-6 items-start md:justify-items-stretch"
                }
            >
                {/* Left Sidebar */}
                {sidebarPosition === "left" ? (
                    <ChangelogSidebar
                        subdomain={subdomain}
                        author={entry.author}
                        publishedAt={entry.publishedAt}
                    />
                ) : null}

                {/* Main Content */}
                <ChangelogContent entry={entry} />

                {/* Right Sidebar */}
                {sidebarPosition === "right" ? (
                    <ChangelogSidebar
                        subdomain={subdomain}
                        author={entry.author}
                        publishedAt={entry.publishedAt}
                    />
                ) : null}
            </div>
        </section>
    );
}

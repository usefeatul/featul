"use client";

import React from "react";
import { ChangelogHeader } from "./ChangelogHeader";
import { subdomainColumns } from "../layout";
import { useDomainBranding } from "../DomainBrandingProvider";
import { ChangelogContent, type ChangelogEntryData } from "./ChangelogContent";
import { ChangelogSidebar } from "./ChangelogSidebar";

export default function SubdomainChangelogDetail({
    entry,
    backLink = "/changelog",
}: {
    entry: ChangelogEntryData;
    /** Kept for callers; the rail no longer needs it. */
    subdomain?: string;
    backLink?: string;
}) {
    const { sidebarPosition = "right" } = useDomainBranding();

    return (
        <section className="min-w-0 mb-12">
            <div
                className={subdomainColumns(sidebarPosition)}
            >
                {/* Left Sidebar */}
                {sidebarPosition === "left" ? (
                    <ChangelogSidebar
                        title={entry.title}
                        author={entry.author}
                        publishedAt={entry.publishedAt}
                    />
                ) : null}

                <div className="flex min-w-0 flex-col">
                    <ChangelogHeader backLink={backLink} />
                    <ChangelogContent entry={entry} />
                </div>

                {/* Right Sidebar */}
                {sidebarPosition === "right" ? (
                    <ChangelogSidebar
                        title={entry.title}
                        author={entry.author}
                        publishedAt={entry.publishedAt}
                    />
                ) : null}
            </div>
        </section>
    );
}

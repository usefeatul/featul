"use client";

import React from "react";
import { ChangelogHeader } from "./ChangelogHeader";
import { subdomainColumns } from "../layout";
import { useDomainBranding } from "../DomainBrandingProvider";
import { ChangelogContent, type ChangelogEntryData } from "./ChangelogContent";
import { ChangelogSidebar } from "./ChangelogSidebar";

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
        <section className="min-w-0 mb-12">
            <ChangelogHeader sidebarPosition={sidebarPosition} backLink={backLink} />

            {/* Main Content Grid */}
            <div
                className={subdomainColumns(sidebarPosition)}
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

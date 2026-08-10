"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import ChangelogVisibility from "./ChangelogVisibility";
import ChangelogTags, { type ChangelogTag } from "./ChangelogTags";
import ChangelogRssFeed from "./ChangelogRssFeed";

export default function ChangelogSection({
  slug,
  initialIsVisible,
  initialPlan,
  initialTags,
  customDomain,
}: {
  slug: string;
  initialIsVisible?: boolean;
  initialPlan?: string;
  initialTags?: ChangelogTag[];
  customDomain?: string | null;
}) {
  return (
    <SectionCard title="Changelog" description="Manage product updates and visibility.">
      <div className="space-y-6">
        <ChangelogVisibility slug={slug} initialIsVisible={initialIsVisible} />
        <ChangelogRssFeed slug={slug} customDomain={customDomain} />
        <ChangelogTags slug={slug} initialPlan={initialPlan} initialTags={initialTags} />
      </div>
    </SectionCard>
  );
}

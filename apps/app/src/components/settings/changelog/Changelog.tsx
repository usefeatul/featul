"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import ChangelogVisibility from "./ChangelogVisibility";
import ChangelogTags, { type ChangelogTag } from "./ChangelogTags";

export default function ChangelogSection({
  slug,
  initialIsVisible,
  initialPlan,
  initialTags,
}: {
  slug: string;
  initialIsVisible?: boolean;
  initialPlan?: string;
  initialTags?: ChangelogTag[];
}) {
  return (
    <SectionCard title="Changelog" description="Manage product updates and visibility.">
      <div className="space-y-6">
        <ChangelogVisibility slug={slug} initialIsVisible={initialIsVisible} />
        <ChangelogTags slug={slug} initialPlan={initialPlan} initialTags={initialTags} />
      </div>
    </SectionCard>
  );
}

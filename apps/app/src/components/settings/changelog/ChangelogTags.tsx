"use client";

import PlanNotice from "../global/PlanNotice";
import { client } from "@featul/api/client";
import type { ChangelogTag } from "@/types/settings";
export type { ChangelogTag } from "@/types/settings";
import { TagManagerSection } from "../global/TagManagerSection";

export default function ChangelogTags({
  slug,
  initialPlan,
  initialTags,
}: {
  slug: string;
  initialPlan?: string;
  initialTags?: ChangelogTag[];
}) {
  return (
    <TagManagerSection
      queryKey={["changelog-tags", slug]}
      initialTags={initialTags}
      plan={initialPlan}
      limitKey="maxChangelogTags"
      limitReachedMessage={(limit) => `Changelog tags limit reached (${limit})`}
      loadTags={async () => {
        const res = await client.changelog.tagsList.$get({ slug });
        const d = await res.json();
        const tags = (d as { tags?: ChangelogTag[] } | null)?.tags;
        return Array.isArray(tags) ? tags : [];
      }}
      createTag={(name) => client.changelog.tagsCreate.$post({ slug, name })}
      deleteTag={(tag) =>
        client.changelog.tagsDelete.$post({ slug, tagId: String(tag.id) })
      }
      title="Changelog Tags"
      description="Create and manage tags to categorize your changelog updates."
      createButtonLabel="Add tag"
      createDialogTitle="Add tag"
      createDialogDescription="Create a new tag for your changelog."
      createActionLabel="Save"
      createLoadingLabel="Saving..."
      renderPlanNotice={(tagCount) => (
        <PlanNotice
          slug={slug}
          feature="changelog_tags"
          plan={initialPlan}
          changelogTagsCount={tagCount}
        />
      )}
    />
  );
}

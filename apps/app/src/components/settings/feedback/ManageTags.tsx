"use client";

import { client } from "@featul/api/client";
import PlanNotice from "../global/PlanNotice";
import { TagManagerSection } from "../global/TagManagerSection";

export interface FeedbackTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export default function ManageTags({
  slug,
  plan,
  initialTags,
}: {
  slug: string;
  plan?: string;
  initialTags?: FeedbackTag[];
}) {
  return (
    <TagManagerSection
      queryKey={["workspace-tags", slug]}
      initialTags={initialTags}
      loadTags={async () => {
        const res = await client.board.tagsByWorkspaceSlug.$get({ slug });
        const d = await res.json();
        const raw =
          (
            d as {
              tags?: {
                id: string;
                name: string;
                slug: string;
                count?: number | null;
              }[];
            } | null
          )?.tags || [];

        return raw.map(
          (t) =>
            ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              postCount: Number(t.count || 0),
            }) satisfies FeedbackTag,
        );
      }}
      createTag={(name) => client.board.tagsCreate.$post({ slug, name })}
      deleteTag={(tag) =>
        client.board.tagsDelete.$post({ slug, tagSlug: String(tag.slug) })
      }
      title="Manage Tags"
      description="Tags are additional labels that can be added to feedback. They are useful for categorizing feedback."
      createButtonLabel="Create tag"
      createDialogTitle="Create tag"
      createDialogDescription="Add a new tag to categorize feedback."
      createActionLabel="Create"
      createLoadingLabel="Creating..."
      renderPlanNotice={(tagCount) => (
        <PlanNotice
          slug={slug}
          feature="tags"
          plan={plan}
          tagsCount={tagCount}
        />
      )}
    />
  );
}

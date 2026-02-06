import { createPageMetadata } from "@/lib/seo";
import { ChangelogEditor } from "@/components/changelog/ChangelogEditor";
import { getChangelogTags } from "../data";

export const revalidate = 0;

export const metadata = createPageMetadata({
    title: "New Changelog Entry",
    description: "Create a new changelog entry",
});

type Props = { params: Promise<{ slug: string }> };

export default async function NewChangelogPage({ params }: Props) {
    const { slug } = await params;

    const tags = await getChangelogTags(slug);

    return (
        <ChangelogEditor
            workspaceSlug={slug}
            mode="create"
            availableTags={tags}
        />
    );
}

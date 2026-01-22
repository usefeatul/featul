import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { ChangelogEditor } from "@/components/changelog";
import { getChangelogEntryForEdit } from "../../data";

export const revalidate = 0;

export const metadata = createPageMetadata({
    title: "Edit Changelog Entry",
    description: "Edit changelog entry",
});

type Props = { params: Promise<{ slug: string; entryId: string }> };

export default async function EditChangelogPage({ params }: Props) {
    const { slug, entryId } = await params;

    const data = await getChangelogEntryForEdit(slug, entryId);

    if (!data) {
        return notFound();
    }

    const { entry, availableTags } = data;

    return (
        <ChangelogEditor
            workspaceSlug={slug}
            mode="edit"
            entryId={entryId}
            initialData={{
                title: entry.title,
                content: entry.content,
                coverImage: entry.coverImage,
                tags: entry.tags,
                status: entry.status,
            }}
            availableTags={availableTags}
        />
    );
}

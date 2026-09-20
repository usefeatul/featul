import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ASSISTANT_PANEL_COOKIE } from "@/lib/changelog/panel";
import { createPageMetadata } from "@/lib/seo";
import { ChangelogEditor } from "@/components/changelog/ChangelogEditor";
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
    const initialAiOpen = (await cookies()).get(ASSISTANT_PANEL_COOKIE)?.value === "true";

    return (
        <ChangelogEditor
            workspaceSlug={slug}
            mode="edit"
            initialAiOpen={initialAiOpen}
            entryId={entryId}
            initialData={{
                title: entry.title,
                content: entry.content,
                summary: entry.summary,
                coverImage: entry.coverImage,
                tags: entry.tags,
                status: entry.status,
            }}
            availableTags={availableTags}
        />
    );
}

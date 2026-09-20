import { createPageMetadata } from "@/lib/seo";
import { ChangelogEditor } from "@/components/changelog/ChangelogEditor";
import { getChangelogTags } from "../data";
import { cookies } from "next/headers";
import { ASSISTANT_PANEL_COOKIE } from "@/lib/changelog/panel";

export const revalidate = 0;

export const metadata = createPageMetadata({
    title: "New Changelog Entry",
    description: "Create a new changelog entry",
});

type Props = { params: Promise<{ slug: string }> };

export default async function NewChangelogPage({ params }: Props) {
    const { slug } = await params;

    const tags = await getChangelogTags(slug);
    const preference = (await cookies()).get(ASSISTANT_PANEL_COOKIE)?.value;

    return (
        <ChangelogEditor
            workspaceSlug={slug}
            mode="create"
            initialAiOpen={preference !== "false"}
            availableTags={tags}
        />
    );
}

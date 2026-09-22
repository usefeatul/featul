import { createPageMetadata } from "@/lib/seo";
import { ChangelogEditor } from "@/components/changelog/ChangelogEditor";
import { getChangelogTags } from "../data";
import { cookies } from "next/headers";
import { ASSISTANT_PANEL_COOKIE } from "@/lib/changelog/panel";
import { PANEL_WIDTH_COOKIES, parsePanelWidth } from "@/lib/panel";

export const revalidate = 0;

export const metadata = createPageMetadata({
    title: "New Changelog Entry",
    description: "Create a new changelog entry",
});

type Props = { params: Promise<{ slug: string }> };

export default async function NewChangelogPage({ params }: Props) {
    const { slug } = await params;

    const tags = await getChangelogTags(slug);
    const cookieStore = await cookies();
    const preference = cookieStore.get(ASSISTANT_PANEL_COOKIE)?.value;

    return (
        <ChangelogEditor
            workspaceSlug={slug}
            mode="create"
            initialAiOpen={preference !== "false"}
            initialAiWidth={parsePanelWidth(cookieStore.get(PANEL_WIDTH_COOKIES.assistant)?.value)}
            availableTags={tags}
        />
    );
}

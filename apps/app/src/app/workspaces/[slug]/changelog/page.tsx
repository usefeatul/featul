import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createPageMetadata } from "@/lib/seo";
import { readInitialSelectionState } from "@/lib/selection-server";
import { getChangelogListData } from "./data";
import { ChangelogList } from "@/components/changelog/ChangelogList";

export const revalidate = 0;

export const metadata = createPageMetadata({
    title: "Changelog",
    description: "Manage changelog entries",
});

type Props = { params: Promise<{ slug: string }> };

export default async function ChangelogListPage({ params }: Props) {
    const { slug } = await params;

    const data = await getChangelogListData(slug);
    if (!data) return notFound();

    const listKey = `changelog-${slug}`;
    const cookieStore = await cookies();
    const { initialIsSelecting, initialSelectedIds } = readInitialSelectionState(cookieStore, listKey);

    const { entries } = data;

    return (
        <section className="space-y-4">
            <ChangelogList
                items={entries}
                workspaceSlug={slug}
                initialTotalCount={data.total}
                initialIsSelecting={initialIsSelecting}
                initialSelectedIds={initialSelectedIds}
            />
        </section>
    );
}

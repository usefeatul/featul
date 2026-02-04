import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createPageMetadata } from "@/lib/seo";
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
    const isSelectingCookie = cookieStore.get(`requests_isSelecting_${listKey}`);
    const initialIsSelecting = isSelectingCookie?.value === "1" || isSelectingCookie?.value === "true";

    const selectedCookie = cookieStore.get(`requests_selected_${listKey}`);
    let initialSelectedIds: string[] = [];
    if (selectedCookie?.value) {
        try {
            const parsed = JSON.parse(decodeURIComponent(selectedCookie.value));
            if (Array.isArray(parsed)) {
                initialSelectedIds = parsed;
            }
        } catch {
            // Ignore JSON parse errors
        }
    }

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

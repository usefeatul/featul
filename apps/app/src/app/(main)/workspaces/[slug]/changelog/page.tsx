import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";

import { Plus, FileText } from "lucide-react";
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
            {entries.length === 0 ? (
                <div className="border rounded-lg p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No changelog entries yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create your first changelog entry to share updates with your users.
                    </p>
                    <Link href={`/workspaces/${slug}/changelog/new`}>
                        <Button variant="nav">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Entry
                        </Button>
                    </Link>
                </div>
            ) : (
                <ChangelogList
                    items={entries}
                    workspaceSlug={slug}
                    initialTotalCount={data.total}
                    initialIsSelecting={initialIsSelecting}
                    initialSelectedIds={initialSelectedIds}
                />
            )}
        </section>
    );
}

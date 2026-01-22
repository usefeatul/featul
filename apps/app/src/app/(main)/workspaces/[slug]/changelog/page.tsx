import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";

import { Plus, FileText } from "lucide-react";
import { getChangelogListData } from "./data";
import ChangelogItem from "@/components/changelog/ChangelogItem";

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
                <div className="overflow-hidden rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-card dark:bg-black/40 border border-border">
                    <ul className="m-0 list-none p-0">
                        {entries.map((entry) => (
                            <ChangelogItem key={entry.id} item={entry} workspaceSlug={slug} />
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

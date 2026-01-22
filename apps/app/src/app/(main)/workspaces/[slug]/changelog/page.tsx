import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { Badge } from "@featul/ui/components/badge";
import { Plus, Edit, FileText } from "lucide-react";
import { getChangelogListData } from "./data";

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

    const { entries, availableTags } = data;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Changelog</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your product updates and announcements
                    </p>
                </div>
                <Link href={`/workspaces/${slug}/changelog/new`}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Entry
                    </Button>
                </Link>
            </div>

            {entries.length === 0 ? (
                <div className="border rounded-lg p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No changelog entries yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create your first changelog entry to share updates with your users.
                    </p>
                    <Link href={`/workspaces/${slug}/changelog/new`}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Entry
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="border rounded-lg divide-y">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium truncate">{entry.title}</h3>
                                    <Badge
                                        variant={entry.status === "published" ? "default" : "secondary"}
                                        className="text-xs"
                                    >
                                        {entry.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {entry.publishedAt && (
                                        <time dateTime={entry.publishedAt.toISOString()}>
                                            {new Date(entry.publishedAt).toLocaleDateString()}
                                        </time>
                                    )}
                                    {!entry.publishedAt && entry.createdAt && (
                                        <time dateTime={entry.createdAt.toISOString()}>
                                            Created {new Date(entry.createdAt).toLocaleDateString()}
                                        </time>
                                    )}
                                    {entry.tags.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <span>·</span>
                                            {entry.tags.slice(0, 3).map((tag) => (
                                                <span key={tag.id} className="text-xs">
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Link href={`/workspaces/${slug}/changelog/${entry.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

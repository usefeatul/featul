import { getWorkspaceBySlug, getWorkspacePosts } from "@/lib/workspace";
import RequestList from "@/components/requests/RequestList";
import HeaderActions from "@/components/requests/HeaderActions";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function WorkspacePage({ params }: Props) {
  const { slug } = await params;
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return notFound();

  const rows = await getWorkspacePosts(slug, { order: "newest" });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end">
        <HeaderActions />
      </div>
      <div className="text-sm text-accent">{rows.length} items</div>
      <RequestList items={rows as any} workspaceSlug={slug} />
    </section>
  );
}

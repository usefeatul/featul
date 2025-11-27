import { getWorkspaceBySlug, getWorkspacePosts, getWorkspacePostsCount } from "@/lib/workspace";
import RequestList from "@/components/requests/RequestList";
import RequestPagination from "@/components/requests/RequestPagination";

import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

type SearchParams = { page?: string | string[]; pageSize?: string | string[] };
type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<SearchParams> };

export default async function WorkspacePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return notFound();

  let sp: SearchParams = {};
  if (searchParams) {
    try {
      sp = await searchParams;
    } catch {}
  }
  const pageSize = Math.max(Number((sp as any).pageSize) || 20, 1);
  const page = Math.max(Number((sp as any).page) || 1, 1);
  const offset = (page - 1) * pageSize;

  const rows = await getWorkspacePosts(slug, { order: "newest", limit: pageSize, offset });
  const totalCount = await getWorkspacePostsCount(slug, {} as any);

  return (
    <section className="space-y-4">
      <RequestList items={rows as any} workspaceSlug={slug} />
      <RequestPagination workspaceSlug={slug} page={page} pageSize={pageSize} totalCount={totalCount} variant="workspace" />
    </section>
  );
}

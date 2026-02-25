import { getWorkspaceBySlug, getWorkspacePosts, getWorkspacePostsCount } from "@/lib/workspace";
import { toRequestItemData } from "@/lib/request-item";
import type { RequestItemData } from "@/types/request";
import { createPageMetadata } from "@/lib/seo";
import { readInitialSelectionState } from "@/lib/selection-server";

export const metadata = createPageMetadata({
  title: "Request",
  description: "All requests",
});
import RequestList from "@/components/requests/RequestList";
import RequestPagination from "@/components/requests/RequestPagination";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
export const revalidate = 30;

type SearchParams = { page?: string | string[] };
type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<SearchParams> };

export default async function WorkspacePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const { initialIsSelecting, initialSelectedIds } = readInitialSelectionState(cookieStore, slug);
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return notFound();

  let sp: SearchParams = {};
  if (searchParams) {
    try {
      sp = await searchParams;
    } catch {
      console.error("Error parsing search params", searchParams);
    }
  }
  const PAGE_SIZE = 20;
  const pageSize = PAGE_SIZE;
  const rawPage = sp.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = Math.max(Number(pageValue) || 1, 1);
  const offset = (page - 1) * pageSize;

  const rows = await getWorkspacePosts(slug, { order: "newest", limit: pageSize, offset });
  const totalCount = await getWorkspacePostsCount(slug, {});

  const items: RequestItemData[] = rows.map((row) =>
    toRequestItemData({
      ...row,
      content: row.content ?? null,
    })
  );

  return (
    <section className="space-y-4">
      <RequestList
        items={items}
        workspaceSlug={slug}
        initialTotalCount={totalCount}
        initialIsSelecting={initialIsSelecting}
        initialSelectedIds={initialSelectedIds}
      />
      <RequestPagination workspaceSlug={slug} page={page} pageSize={pageSize} totalCount={totalCount} variant="workspace" />
    </section>
  );
}

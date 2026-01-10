import { getWorkspaceBySlug, getWorkspacePosts, getWorkspacePostsCount } from "@/lib/workspace";
import { createPageMetadata } from "@/lib/seo";

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
  const cookieName = `requests_isSelecting_${slug}`;
  const cookieValue = cookieStore.get(cookieName)?.value;
  const initialIsSelecting = cookieValue === "1" || cookieValue === "true";
  const selectedCookieName = `requests_selected_${slug}`;
  const selectedRaw = cookieStore.get(selectedCookieName)?.value;
  let initialSelectedIds: string[] | undefined;
  if (selectedRaw) {
    try {
      const decoded = decodeURIComponent(selectedRaw);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        initialSelectedIds = parsed.filter((v) => typeof v === "string") as string[];
      }
    } catch { }
  }
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return notFound();

  let sp: SearchParams = {};
  if (searchParams) {
    try {
      sp = await searchParams;
    } catch { }
  }
  const PAGE_SIZE = 20;
  const pageSize = PAGE_SIZE;
  const page = Math.max(Number((sp as any).page) || 1, 1);
  const offset = (page - 1) * pageSize;

  const rows = await getWorkspacePosts(slug, { order: "newest", limit: pageSize, offset });
  const totalCount = await getWorkspacePostsCount(slug, {} as any);

  return (
    <section className="space-y-4">
      <RequestList
        items={rows as any}
        workspaceSlug={slug}
        initialTotalCount={totalCount}
        initialIsSelecting={initialIsSelecting}
        initialSelectedIds={initialSelectedIds}
      />
      <RequestPagination workspaceSlug={slug} page={page} pageSize={pageSize} totalCount={totalCount} variant="workspace" />
    </section>
  );
}

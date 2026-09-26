import { getWorkspaceBySlug, getWorkspacePosts, getWorkspacePostsCount } from "@/lib/workspace";
import { toRequestItemData } from "@/lib/request/item";
import type { RequestItemData } from "@/types/request";
import { createPageMetadata } from "@/lib/seo";
import { readInitialSelectionState } from "@/lib/selection/server";
import {
  parsePositiveIntSearchParam,
  resolveSearchParams,
} from "@/utils/search/params";

export const metadata = createPageMetadata({
  title: "Request",
  description: "All requests",
});
import RequestList from "@/components/requests/RequestList";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { REQUEST_BATCH_SIZE } from "@/lib/request/pagination";
import { DEFAULT_REQUEST_STATUSES } from "@/lib/request/statuses";
export const revalidate = 30;

type SearchParams = { page?: string | string[] };
type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<SearchParams> };

export default async function WorkspacePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const { initialIsSelecting, initialSelectedIds } = readInitialSelectionState(cookieStore, slug);
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return notFound();

  const sp = (await resolveSearchParams(searchParams)) ?? {};
  const pageSize = REQUEST_BATCH_SIZE;
  const page = parsePositiveIntSearchParam(sp.page);
  const offset = (page - 1) * pageSize;

  const statuses = [...DEFAULT_REQUEST_STATUSES];
  const [rows, totalCount] = await Promise.all([
    getWorkspacePosts(slug, {
      statuses,
      order: "newest",
      limit: pageSize,
      offset,
    }),
    getWorkspacePostsCount(slug, { statuses }),
  ]);

  const items: RequestItemData[] = rows.map((row) =>
    toRequestItemData({
      ...row,
      content: row.content ?? null,
    })
  );

  return (
    <section className="-mx-4 space-y-3 sm:-mx-8 lg:-mx-12 xl:-mx-16">
      <RequestList
        items={items}
        workspaceSlug={slug}
        initialTotalCount={totalCount}
        initialOffset={offset + items.length}
        variant="workspace"
        initialIsSelecting={initialIsSelecting}
        initialSelectedIds={initialSelectedIds}
      />
    </section>
  );
}

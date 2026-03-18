import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createPageMetadata } from "@/lib/seo";
import { readInitialSelectionState } from "@/lib/selection-server";
import {
  parsePositiveIntSearchParam,
  resolveSearchParams,
} from "@/utils/search-params";
import { getChangelogListData } from "./data";
import { ChangelogList } from "@/components/changelog/ChangelogList";
import RequestPagination from "@/components/requests/RequestPagination";

export const revalidate = 0;
const PAGE_SIZE = 20;

export const metadata = createPageMetadata({
  title: "Changelog",
  description: "Manage changelog entries",
});

type SearchParams = { page?: string | string[] };
type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
};

export default async function ChangelogListPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const sp = (await resolveSearchParams(searchParams)) ?? {};
  const page = parsePositiveIntSearchParam(sp.page);
  const pageSize = PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  const data = await getChangelogListData(slug, { limit: pageSize, offset });
  if (!data) return notFound();

  const listKey = `changelog-${slug}`;
  const cookieStore = await cookies();
  const { initialIsSelecting, initialSelectedIds } = readInitialSelectionState(
    cookieStore,
    listKey,
  );

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
      <RequestPagination
        workspaceSlug={slug}
        page={page}
        pageSize={pageSize}
        totalCount={data.total}
        variant="changelog"
      />
    </section>
  );
}

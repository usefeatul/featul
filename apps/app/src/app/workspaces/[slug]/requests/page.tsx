import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import RequestList from "@/components/requests/RequestList";
import PostCountSeed from "@/components/requests/PostCountSeed";
import { createPageMetadata } from "@/lib/seo";
import { readInitialSelectionState } from "@/lib/selection/server";
import { resolveSearchParams } from "@/utils/search/params";
import { loadRequestsPageData, type RequestsSearchParams } from "./data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<RequestsSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return createPageMetadata({
    title: "Requests",
    description: "Workspace requests",
    path: `/workspaces/${slug}/requests`,
    indexable: false,
  });
}

export default async function RequestsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const { initialIsSelecting, initialSelectedIds } = readInitialSelectionState(cookieStore, slug);

  const sp = await resolveSearchParams(searchParams);

  const data = await loadRequestsPageData({ slug, searchParams: sp });
  if (!data) return notFound();

  return (
    <section className="-mx-4 space-y-3 sm:-mx-8 lg:-mx-12 xl:-mx-16">
      <PostCountSeed
        slug={slug}
        statuses={data.statusFilter}
        boards={data.boardSlugs}
        tags={data.tagSlugs}
        search={data.search}
        count={data.totalCount}
      />
      <RequestList
        items={data.rows}
        workspaceSlug={slug}
        initialTotalCount={data.totalCount}
        initialOffset={(data.page - 1) * data.pageSize + data.rows.length}
        initialIsSelecting={initialIsSelecting}
        initialSelectedIds={initialSelectedIds}
      />
    </section>
  );
}

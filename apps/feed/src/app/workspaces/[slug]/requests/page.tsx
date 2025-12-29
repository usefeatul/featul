import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RequestList from "@/components/requests/RequestList";
import PostCountSeed from "@/components/requests/PostCountSeed";
import RequestPagination from "@/components/requests/RequestPagination";
import { createPageMetadata } from "@/lib/seo";
import { loadRequestsPageData, type RequestsSearchParams } from "./data";

export const revalidate = 30;

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

  let sp: RequestsSearchParams | undefined;
  if (searchParams) {
    try {
      sp = await searchParams;
    } catch {
      sp = undefined;
    }
  }

  const data = await loadRequestsPageData({ slug, searchParams: sp });
  if (!data) return notFound();

  return (
    <section className="space-y-4">
      <PostCountSeed
        slug={slug}
        statuses={data.statusFilter}
        boards={data.boardSlugs}
        tags={data.tagSlugs}
        search={data.search}
        count={data.totalCount}
      />
      <RequestList items={data.rows as any} workspaceSlug={slug} initialTotalCount={data.totalCount} />
      <RequestPagination
        workspaceSlug={slug}
        page={data.page}
        pageSize={data.pageSize}
        totalCount={data.totalCount}
      />
    </section>
  );
}

import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { getWorkspacePosts } from "@/lib/workspace";
import { toRequestItemData } from "@/lib/request-item";
import RoadmapBoard from "@/components/roadmap/RoadmapBoard";
import { readInitialCollapsedByStatus } from "@/lib/roadmap.server";
import { getServerSession } from "@featul/auth/session";
import { resolveSearchParams } from "@/utils/search-params";
import { parseRoadmapFiltersFromRecord } from "@/utils/roadmap-url";
import { boardSlugsForSearch } from "@featul/api/shared/post-search";

export const revalidate = 30;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return createPageMetadata({
    title: "Roadmap",
    description: "Workspace roadmap",
    path: `/workspaces/${slug}/roadmap`,
    indexable: false,
  });
}

export default async function RoadmapPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await resolveSearchParams(searchParams)) ?? {};
  const filters = parseRoadmapFiltersFromRecord(sp);
  const boardSlugs = boardSlugsForSearch(filters.search, filters.board);

  const session = await getServerSession();
  const rows = await getWorkspacePosts(slug, {
    limit: 5000,
    search: filters.search || undefined,
    boardSlugs: boardSlugs.length ? boardSlugs : undefined,
    tagSlugs: filters.tag.length ? filters.tag : undefined,
  });
  const items = rows.map(toRequestItemData);

  const initialCollapsedByStatus = readInitialCollapsedByStatus(slug);

  return (
    <RoadmapBoard
      workspaceSlug={slug}
      items={items}
      currentUser={
        session?.user
          ? { name: session.user.name, image: session.user.image }
          : undefined
      }
      initialCollapsedByStatus={await initialCollapsedByStatus}
    />
  );
}

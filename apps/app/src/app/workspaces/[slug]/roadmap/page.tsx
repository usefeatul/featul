import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { getWorkspacePosts } from "@/lib/workspace";
import { toRequestItemData } from "@/lib/request-item";
import RoadmapBoard from "@/components/roadmap/RoadmapBoard";
import { readInitialCollapsedByStatus } from "@/lib/roadmap.server";
import { getServerSession } from "@featul/auth/session";

export const revalidate = 30;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return createPageMetadata({
    title: "Roadmap",
    description: "Workspace roadmap",
    path: `/workspaces/${slug}/roadmap`,
    indexable: false,
  });
}

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params;

  const session = await getServerSession();
  const rows = await getWorkspacePosts(slug, { limit: 5000 });
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

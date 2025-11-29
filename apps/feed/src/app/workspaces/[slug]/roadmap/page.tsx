import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { getWorkspacePosts } from "@/lib/workspace"
import RoadmapBoard from "@/components/roadmap/RoadmapBoard"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Roadmap",
    description: "Workspace roadmap",
    path: `/workspaces/${slug}/roadmap`,
    indexable: false,
  })
}

export default async function RoadmapPage({ params }: Props) {
  const { slug } = await params

  const rows = await getWorkspacePosts(slug, { limit: 5000 })

  return <RoadmapBoard workspaceSlug={slug} items={rows as any} />
}

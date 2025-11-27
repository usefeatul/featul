import type { Metadata } from "next"
import SettingsTabs from "@/components/settings/global/SettingsTabs"
import { createPageMetadata } from "@/lib/seo"
import { getSectionMeta } from "@/config/sections"
import { client } from "@feedgot/api/client"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string; section: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  const m = getSectionMeta(section)
  return createPageMetadata({
    title: `${m.label}`,
    description: m.desc,
    path: `/workspaces/${slug}/settings/${section}`,
    indexable: false,
  })
}

export default async function SettingsSectionPage({ params }: Props) {
  const { slug, section } = await params
  if (section === "team") {
    try {
      const res = await client.team.membersByWorkspaceSlug.$get({ slug })
      const data = await res.json()
      return <SettingsTabs slug={slug} selectedSection={section} initialTeam={{ members: data?.members || [], invites: data?.invites || [], meId: data?.meId || null }} />
    } catch {
      return <SettingsTabs slug={slug} selectedSection={section} />
    }
  }
  return <SettingsTabs slug={slug} selectedSection={section} />
}

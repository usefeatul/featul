import type { Metadata } from "next"
import SettingsTabs from "@/components/settings/global/SettingsTabs"
import { createPageMetadata } from "@/lib/seo"
import { getSectionMeta } from "@/config/sections"

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
  return <SettingsTabs slug={slug} selectedSection={section} />
}

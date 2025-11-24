import type { Metadata } from "next"
import SettingsTabs from "@/components/settings/global/SettingsTabs"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Settings",
    description: "View and manage your workspace settings.",
    path: `/workspaces/${slug}/settings`,
    indexable: false,
  })
}

export default async function SettingsPage({ params }: Props) {
  const { slug } = await params
  return <SettingsTabs slug={slug} />
}

import type { Metadata } from "next"
import SettingsTabs from "@/components/settings/global/SettingsTabs"
import { createPageMetadata } from "@/lib/seo"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"

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
  let initialPlan: string | undefined
  try {
    const [ws] = await db
      .select({ plan: workspace.plan })
      .from(workspace)
      .where(eq(workspace.slug, slug))
      .limit(1)
    initialPlan = String((ws as any)?.plan || "free")
  } catch {}
  return <SettingsTabs slug={slug} initialPlan={initialPlan} />
}

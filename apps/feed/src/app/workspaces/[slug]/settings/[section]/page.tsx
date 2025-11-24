import type { Metadata } from "next"
import SettingsTabs from "@/components/settings/global/SettingsTabs"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ slug: string; section: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  const map: Record<string, { label: string; desc: string }> = {
    branding: { label: "Branding", desc: "Customize logo and identity" },
    team: { label: "Team", desc: "Manage members and roles" },
    feedback: { label: "Feedback", desc: "Configure boards and feedback" },
    changelog: { label: "Changelog", desc: "Manage product updates" },
    billing: { label: "Billing", desc: "Subscriptions and invoices" },
    domain: { label: "Domain", desc: "Custom domain settings" },
    integrations: { label: "Integrations", desc: "Connect external tools" },
    sso: { label: "SSO", desc: "Single sign-on setup" },
    data: { label: "Data", desc: "Export and data controls" },
  }
  const m = map[section] || { label: "Settings", desc: "View and manage your workspace settings." }
  return createPageMetadata({
    title: `Settings – ${m.label}`,
    description: m.desc,
    path: `/workspaces/${slug}/settings/${section}`,
    indexable: false,
  })
}

export default async function SettingsSectionPage({ params }: Props) {
  const { slug } = await params
  return <SettingsTabs slug={slug} />
}

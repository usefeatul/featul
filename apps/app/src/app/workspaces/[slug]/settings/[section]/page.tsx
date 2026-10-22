import type { Metadata } from "next"
import SettingsServer from "@/components/settings/global/SettingsServer"
import AccountServer from "@/components/account/AccountServer"
import { createPageMetadata } from "@/lib/seo"
import { getSectionMeta } from "@/config/sections"
import { getSettingsInitialData } from "@/lib/workspace"
import { getServerSession, listServerSessions, listServerAccounts, listServerPasskeys } from "@featul/auth/session"
import { redirect } from "next/navigation"

export const revalidate = 30

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
  const session = await getServerSession()

  if (section === "account") {
    if (!session?.user) {
      redirect(`/auth/signin?redirect=/workspaces/${slug}/settings/account`)
    }
    const [initialSessions, initialAccounts, initialPasskeys] = await Promise.all([
      listServerSessions(),
      listServerAccounts(),
      listServerPasskeys(),
    ])
    return (
      <AccountServer
        initialUser={session.user}
        twoFactorEnabled={session.user?.twoFactorEnabled}
        initialSessions={initialSessions}
        initialAccounts={initialAccounts}
        initialPasskeys={initialPasskeys}
      />
    )
  }

  const initialData = await getSettingsInitialData(slug, session?.user?.id, section)

  return <SettingsServer slug={slug} selectedSection={section} {...initialData} />
}

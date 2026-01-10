import type { Metadata } from "next"
import AccountServer from "@/components/account/AccountServer"
import { createPageMetadata } from "@/lib/seo"
import { getAccountSectionMeta } from "@/config/account-sections"
import { getServerSession, listServerSessions } from "@featul/auth/session"
import { redirect } from "next/navigation"

export const revalidate = 30

type Props = { params: Promise<{ slug: string; section: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  const m = getAccountSectionMeta(section)
  return createPageMetadata({
    title: m.label,
    description: m.desc,
    path: `/workspaces/${slug}/account/${section}`,
    indexable: false,
  })
}

export default async function AccountSectionPage({ params }: Props) {
  const { slug, section } = await params
  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/sign-in?redirect=/workspaces/${slug}/account/${encodeURIComponent(section)}`)
  }
  const initialSessions = section === "security" ? await listServerSessions() : undefined
  return (
    <AccountServer
      slug={slug}
      selectedSection={section}
      initialUser={session.user}
      initialMeSession={session as any}
      initialSessions={initialSessions}
    />
  )
}

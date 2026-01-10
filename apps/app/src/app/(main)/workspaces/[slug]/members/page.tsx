import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import type { Member } from "@/types/team"
import MemberList from "@/components/team/MemberList"
import { getSettingsInitialData } from "@/lib/workspace"

export const revalidate = 30

export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession()
  if (!session?.user?.id) {
    redirect(`/auth/sign-in?redirect=/workspaces/${slug}/members`)
  }

  const data = await getSettingsInitialData(slug, session.user.id)
  const initialMembers: Member[] = (data?.initialTeam?.members || []) as Member[]

  return (
    <section className="space-y-4">
      <MemberList slug={slug} initialMembers={initialMembers} />
    </section>
  )
}

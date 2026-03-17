import type { Metadata } from "next"
import MemberDetail from "@/components/team/MemberDetail"
import { loadMemberActivity, loadMemberStats } from "@/lib/member-server"
import { requireSignedInUser } from "@/lib/server-auth"
import { createPageMetadata } from "@/lib/seo"
import { getSettingsInitialData } from "@/lib/workspace"

export const revalidate = 30

type Props = { params: Promise<{ slug: string; userId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, userId } = await params
  return createPageMetadata({
    title: "Member details",
    description: "Workspace member details",
    path: `/workspaces/${slug}/members/${userId}`,
    indexable: false,
  })
}

export default async function MemberDetailPage({ params }: Props) {
  const { slug, userId } = await params
  const user = await requireSignedInUser(`/workspaces/${slug}/members/${userId}`)
  const settings = await getSettingsInitialData(slug, user.id)
  const initialMembers = settings.initialTeam?.members ?? []
  const initialMember = initialMembers.find((member) => member.userId === userId)
  const [{ stats: initialStats, topPosts: initialTopPosts }, initialActivity] =
    await Promise.all([
      loadMemberStats(slug, userId, user.id),
      loadMemberActivity(slug, userId, user.id),
    ])

  return (
    <section className="space-y-4">
      <MemberDetail
        slug={slug}
        userId={userId}
        initialMembers={initialMembers}
        initialMember={initialMember}
        initialStats={initialStats}
        initialTopPosts={initialTopPosts}
        initialActivity={initialActivity}
      />
    </section>
  )
}

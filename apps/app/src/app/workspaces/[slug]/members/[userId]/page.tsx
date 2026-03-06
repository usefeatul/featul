import MemberDetail from "@/components/team/MemberDetail"
import { loadMemberActivity, loadMemberStats } from "@/lib/member-server"
import { requireSignedInUser } from "@/lib/server-auth"
import { getSettingsInitialData } from "@/lib/workspace"

export const revalidate = 30

export default async function MemberDetailPage({ params }: { params: Promise<{ slug: string; userId: string }> }) {
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

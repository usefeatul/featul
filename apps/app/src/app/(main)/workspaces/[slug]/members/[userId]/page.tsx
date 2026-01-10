import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import type { Member } from "@/types/team"
import MemberDetail from "@/components/team/MemberDetail"
import { getSettingsInitialData } from "@/lib/workspace"
import { client } from "@featul/api/client"

export const revalidate = 30

export default async function MemberDetailPage({ params }: { params: Promise<{ slug: string; userId: string }> }) {
  const { slug, userId } = await params
  const session = await getServerSession()
  if (!session?.user?.id) {
    redirect(`/auth/sign-in?redirect=/workspaces/${slug}/members/${userId}`)
  }

  const settings = await getSettingsInitialData(slug, session.user.id)
  const members = (settings?.initialTeam?.members || []) as Member[]
  const initialMember: Member | null = members.find((m) => m.userId === userId) || null

  let initialStats: { posts: number; comments: number; upvotes: number } | null = null
  let initialTopPosts: Array<{ id: string; title: string; slug: string; upvotes: number; status?: string | null }> = []
  let initialActivity: { items: any[]; nextCursor: string | null } = { items: [], nextCursor: null }

  try {
    const statsRes = await client.member.statsByWorkspaceSlug.$get({ slug, userId })
    if (statsRes.ok) {
      const statsJson = (await statsRes.json()) as {
        stats?: { posts: number; comments: number; upvotes: number }
        topPosts?: Array<{ id: string; title: string; slug: string; upvotes: number; status?: string | null }>
      }
      initialStats = statsJson.stats || { posts: 0, comments: 0, upvotes: 0 }
      initialTopPosts = statsJson.topPosts || []
    }
  } catch {}

  try {
    const activityRes = await client.member.activityByWorkspaceSlug.$get({ slug, userId, limit: 20 })
    if (activityRes.ok) {
      const activityJson = (await activityRes.json()) as { items?: any[]; nextCursor?: string | null }
      initialActivity = {
        items: activityJson.items || [],
        nextCursor: activityJson.nextCursor ?? null,
      }
    }
  } catch {}

  return (
    <section className="space-y-4">
      <MemberDetail
        slug={slug}
        userId={userId}
        initialMember={initialMember || undefined}
        initialStats={initialStats || undefined}
        initialTopPosts={initialTopPosts || []}
        initialActivity={initialActivity}
      />
    </section>
  )
}

import { getServerSession } from "@oreilla/auth/session"
import { redirect } from "next/navigation"
import type { Member } from "@/types/team"
import MemberDetail from "@/components/team/MemberDetail"
import { getSettingsInitialData } from "@/lib/workspace"

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

  const initialStats: { posts: number; comments: number; upvotes: number } | null = null
  const initialTopPosts: Array<{ id: string; title: string; slug: string; upvotes: number }> = []

  const initialActivity: { items: any[]; nextCursor: string | null } = { items: [], nextCursor: null }

  return (
    <MemberDetail
      slug={slug}
      userId={userId}
      initialMember={initialMember || undefined}
      initialStats={initialStats || undefined}
      initialTopPosts={initialTopPosts || []}
      initialActivity={initialActivity}
    />
  )
}

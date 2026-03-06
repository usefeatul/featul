import MemberList from "@/components/team/MemberList"
import { requireSignedInUser } from "@/lib/server-auth"
import { getSettingsInitialData } from "@/lib/workspace"

export const revalidate = 30

export default async function MembersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await requireSignedInUser(`/workspaces/${slug}/members`)
  const data = await getSettingsInitialData(slug, user.id)
  const initialMembers = data.initialTeam?.members ?? []

  return (
    <section className="space-y-4">
      <MemberList slug={slug} initialMembers={initialMembers} />
    </section>
  )
}

import type { Metadata } from "next"
import MemberList from "@/components/team/MemberList"
import { requireSignedInUser } from "@/lib/server-auth"
import { createPageMetadata } from "@/lib/seo"
import { getSettingsInitialData } from "@/lib/workspace"

export const revalidate = 30

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Members",
    description: "Workspace members",
    path: `/workspaces/${slug}/members`,
    indexable: false,
  })
}

export default async function MembersPage({ params }: Props) {
  const { slug } = await params
  const user = await requireSignedInUser(`/workspaces/${slug}/members`)
  const data = await getSettingsInitialData(slug, user.id)
  const initialMembers = data.initialTeam?.members ?? []

  return (
    <section className="mx-auto w-full max-w-[72rem] space-y-4 pt-5 lg:pt-7">
      <MemberList slug={slug} initialMembers={initialMembers} />
    </section>
  )
}

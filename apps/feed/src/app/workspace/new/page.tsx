import type { Metadata } from "next"
import WorkspaceWizard from "@/components/workspaces/wizard/Wizard"
import { createPageMetadata } from "@/lib/seo"
import { redirect } from "next/navigation"
import { getServerSession } from "@feedgot/auth/session"
import { db, workspace, workspaceMember } from "@feedgot/db"
import { eq } from "drizzle-orm"

export const metadata: Metadata = createPageMetadata({
  title: "New Project",
  description: "Create a new project in Feedgot.",
  path: "/workspace/new",
  indexable: false,
})

export default async function NewWorkspacePage() {
  const session = await getServerSession()
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/workspace/new")
  }
  const userId = session.user.id

  const [owned] = await db
    .select({ slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.ownerId, userId))
    .limit(1)

  if (owned?.slug) {
    redirect(`/workspaces/${owned.slug}`)
  }

  const [memberWs] = await db
    .select({ slug: workspace.slug })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
    .where(eq(workspaceMember.userId, userId))
    .limit(1)

  if (memberWs?.slug) {
    redirect(`/workspaces/${memberWs.slug}`)
  }

  return <WorkspaceWizard />
}

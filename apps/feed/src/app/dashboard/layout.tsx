import { redirect } from "next/navigation"
import { getServerSession } from "@feedgot/auth/session"
import { db, workspace, workspaceMember } from "@feedgot/db"
import { eq } from "drizzle-orm"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/dashboard")
  }
  const userId = session.user.id
  const owned = await db.select({ id: workspace.id }).from(workspace).where(eq(workspace.ownerId, userId)).limit(1)
  const member = await db.select({ id: workspaceMember.id }).from(workspaceMember).where(eq(workspaceMember.userId, userId)).limit(1)
  if (owned.length === 0 && member.length === 0) {
    redirect("/workspace/new")
  }
  return <>{children}</>
}
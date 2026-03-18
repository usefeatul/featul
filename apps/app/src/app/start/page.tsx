import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { redirect } from "next/navigation"
import { getServerSession } from "@featul/auth/session"
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog"
import { resolveAuthenticatedAppPath } from "@/lib/auth-redirect"

export const revalidate = 30
export const metadata: Metadata = createPageMetadata({
  title: "Welcome to featul",
  description: "Create your first workspace in featul.",
  path: "/start",
  indexable: false,
})

export default async function StartPage() {
  const session = await getServerSession()
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/start")
  }
  const userId = session.user.id
  if (!userId) redirect("/auth/sign-in?redirect=/start")
  const targetPath = await resolveAuthenticatedAppPath(userId, "")
  if (targetPath !== "/start") redirect(targetPath)
  return (
    <div className="min-h-screen bg-background">
      <CreateWorkspaceDialog open />
    </div>
  )
}

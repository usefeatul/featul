import type { Metadata } from "next"
import { CreateWorkspaceDialog } from "@/components/workspaces/CreateWorkspaceDialog"
import { createPageMetadata } from "@/lib/seo"
import { redirect } from "next/navigation"
import { getServerSession } from "@featul/auth/session"

export const revalidate = 30
export const metadata: Metadata = createPageMetadata({
  title: "New Project",
  description: "Create a new project in featul.",
  path: "/workspaces/new",
  indexable: false,
})

export default async function NewWorkspacePage() {
  const session = await getServerSession()
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/workspaces/new")
  }
  return (
    <div className="min-h-screen bg-background">
      <CreateWorkspaceDialog open />
    </div>
  )
}

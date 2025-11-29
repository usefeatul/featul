import type { Metadata } from "next"
import WorkspaceWizard from "@/components/wizard/Wizard"
import { createPageMetadata } from "@/lib/seo"
import { redirect } from "next/navigation"
import { getServerSession } from "@feedgot/auth/session"

export const dynamic = "force-dynamic"
export const metadata: Metadata = createPageMetadata({
  title: "New Project",
  description: "Create a new project in Feedgot.",
  path: "/workspaces/new",
  indexable: false,
})

export default async function NewWorkspacePage() {
  const session = await getServerSession()
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/workspaces/new")
  }
  return <WorkspaceWizard />
}

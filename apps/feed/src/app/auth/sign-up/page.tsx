import type { Metadata } from "next"
import SignUp from "@/components/auth/SignUp"
import { createPageMetadata } from "@/lib/seo"
import { getServerSession } from "@oreilla/auth/session"
import { redirect } from "next/navigation"
import { findFirstAccessibleWorkspaceSlug } from "@/lib/workspace"

export const dynamic = "force-dynamic"


export const metadata: Metadata = createPageMetadata({
  title: "Create Account",
  description: "Sign up for oreilla.",
  path: "/auth/sign-up",
  indexable: false,
})

export default async function SignUpPage({ searchParams }: { searchParams?: { redirect?: string } }) {
  const session = await getServerSession()
  if (session?.user) {
    const raw = searchParams?.redirect || ""
    if (raw?.startsWith("/")) {
      redirect(raw)
    }
    const slug = await findFirstAccessibleWorkspaceSlug(session.user.id)
    if (slug) redirect(`/workspaces/${slug}`)
    redirect("/workspaces/new")
  }
  return <SignUp />
}
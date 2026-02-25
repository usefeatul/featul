import type { Metadata } from "next"
import SignIn from "@/components/auth/SignIn"
import { createPageMetadata } from "@/lib/seo"
import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import { findFirstAccessibleWorkspaceSlug } from "@/lib/workspace"
import { normalizeInternalRedirectPath } from "@/utils/path"

export const dynamic = "force-dynamic"


export const metadata: Metadata = createPageMetadata({
  title: "Sign In",
  description: "Access your featul account.",
  path: "/auth/sign-in",
  indexable: false,
})

export default async function SignInPage({ searchParams }: { searchParams?: { redirect?: string } }) {
  const session = await getServerSession()
  if (session?.user) {
    const raw = searchParams?.redirect || ""
    const safePath = normalizeInternalRedirectPath(raw)
    if (safePath) {
      redirect(safePath)
    }
    const slug = await findFirstAccessibleWorkspaceSlug(session.user.id!)
    if (slug) redirect(`/workspaces/${slug}`)
    redirect("/start")
  }
  return <SignIn />
}

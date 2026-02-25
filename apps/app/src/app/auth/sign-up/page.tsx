import type { Metadata } from "next"
import SignUp from "@/components/auth/SignUp"
import { createPageMetadata } from "@/lib/seo"
import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import { findFirstAccessibleWorkspaceSlug } from "@/lib/workspace"
import { normalizeInternalRedirectPath } from "@/utils/redirect-path"

export const dynamic = "force-dynamic"


export const metadata: Metadata = createPageMetadata({
  title: "Create Account",
  description: "Sign up for featul.",
  path: "/auth/sign-up",
  indexable: false,
})

export default async function SignUpPage({ searchParams }: { searchParams?: { redirect?: string } }) {
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
  return <SignUp />
}

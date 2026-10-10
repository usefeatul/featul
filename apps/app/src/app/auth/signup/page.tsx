import type { Metadata } from "next"
import SignUp from "@/components/auth/SignUp"
import { createPageMetadata } from "@/lib/seo"
import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import { resolveAuthenticatedAppPath } from "@/lib/auth/redirect"

export const dynamic = "force-dynamic"


export const metadata: Metadata = createPageMetadata({
  title: "Create Account",
  description: "Sign up for featul.",
  path: "/auth/signup",
  indexable: false,
})

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const session = await getServerSession()
  if (session?.user) {
    const userId = session.user.id
    if (!userId) redirect("/start")
    const params = await searchParams
    redirect(await resolveAuthenticatedAppPath(userId, params.redirect || ""))
  }
  return <SignUp />
}

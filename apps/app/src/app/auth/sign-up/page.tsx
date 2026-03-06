import type { Metadata } from "next"
import SignUp from "@/components/auth/SignUp"
import { createPageMetadata } from "@/lib/seo"
import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import { resolveAuthenticatedAppPath } from "@/lib/auth-redirect"

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
    const userId = session.user.id
    if (!userId) redirect("/start")
    redirect(await resolveAuthenticatedAppPath(userId, searchParams?.redirect || ""))
  }
  return <SignUp />
}

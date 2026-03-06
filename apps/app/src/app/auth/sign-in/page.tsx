import type { Metadata } from "next"
import SignIn from "@/components/auth/SignIn"
import { createPageMetadata } from "@/lib/seo"
import { getServerSession } from "@featul/auth/session"
import { redirect } from "next/navigation"
import { resolveAuthenticatedAppPath } from "@/lib/auth-redirect"

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
    const userId = session.user.id
    if (!userId) redirect("/start")
    redirect(await resolveAuthenticatedAppPath(userId, searchParams?.redirect || ""))
  }
  return <SignIn />
}

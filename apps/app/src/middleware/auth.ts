import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

/** `/workspaces*`: require a session cookie. Missing → `/auth/signin` with return URL. */
export function enforceWorkspaceAuth(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const needsAuth = pathname.startsWith("/workspaces")
  if (needsAuth) {
    const cookie = getSessionCookie(req)
    if (!cookie) {
      const url = new URL("/auth/signin", req.url)
      url.searchParams.set("redirect", `${pathname}${req.nextUrl.search}`)
      return NextResponse.redirect(url)
    }
  }
  return null
}

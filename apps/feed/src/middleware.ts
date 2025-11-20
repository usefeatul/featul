import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const needsAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/workspaces")
  if (needsAuth) {
    const cookie = getSessionCookie(req)
    if (!cookie) {
      const url = new URL("/auth/sign-in", req.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*","/workspaces/:path*"],
}
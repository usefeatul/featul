import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const first = pathname.split("/")[1] || ""

  const host = req.headers.get("host") || ""
  const hostNoPort = host.replace(/:\d+$/, "")
  const parts = hostNoPort.split(".")
  const isLocal = parts[parts.length - 1] === "localhost"
  const isMainDomain = hostNoPort.endsWith(".feedgot.com")
  const hasSub = (isLocal && parts.length >= 2) || (isMainDomain && parts.length >= 3)
  const subdomain = hasSub ? parts[0] : ""
  const reservedSubdomains = new Set(["www", "app"]) 

  if (subdomain && !reservedSubdomains.has(subdomain)) {
    if (pathname === "/") {
      const url = req.nextUrl.clone()
      url.pathname = `/${subdomain}/${subdomain}`
      return NextResponse.rewrite(url)
    }
    const publicBoards = new Set(["issues", "roadmap", "changelog"]) 
    if (publicBoards.has(first)) {
      return NextResponse.next()
    }
  }

  const needsAuth = pathname.startsWith("/workspaces")
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
  matcher: ["/", "/workspaces/:path*"],
}

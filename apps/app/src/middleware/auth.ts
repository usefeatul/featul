import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { normalizeInternalRedirectPath } from "@/utils/path"

export function handleAuthRedirects(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (pathname.startsWith("/auth/sign-in") || pathname.startsWith("/auth/sign-up")) {
    const sessionCookie = getSessionCookie(req)
    if (sessionCookie) {
      const raw = req.nextUrl.searchParams.get("redirect") || ""
      const safePath = normalizeInternalRedirectPath(raw)
      if (safePath) {
        const url = new URL(safePath, req.url)
        return NextResponse.redirect(url)
      }
      const last = req.cookies.get("lastWorkspaceSlug")?.value || ""
      if (last) {
        const url = new URL(`/workspaces/${last}`, req.url)
        return NextResponse.redirect(url)
      }
      const url = new URL("/start", req.url)
      return NextResponse.redirect(url)
    }
  }
  return null
}

export function handleStartRedirect(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (pathname === "/start") {
    const sessionCookie = getSessionCookie(req)
    if (sessionCookie) {
      const raw = req.nextUrl.searchParams.get("redirect") || ""
      const safePath = normalizeInternalRedirectPath(raw)
      if (safePath) {
        const url = new URL(safePath, req.url)
        return NextResponse.redirect(url)
      }
      const last = req.cookies.get("lastWorkspaceSlug")?.value || ""
      if (last) {
        const url = new URL(`/workspaces/${last}`, req.url)
        return NextResponse.redirect(url)
      }
    }
  }
  return null
}

export function enforceWorkspaceAuth(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const needsAuth = pathname.startsWith("/workspaces")
  if (needsAuth) {
    const cookie = getSessionCookie(req)
    if (!cookie) {
      const url = new URL("/auth/sign-in", req.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }
  return null
}

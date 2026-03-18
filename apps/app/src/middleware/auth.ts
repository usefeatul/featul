import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { resolveSafeInternalRedirect } from "@/lib/auth-redirect"

function resolveSignedInDestination(
  req: NextRequest,
  options?: { includeStartFallback?: boolean }
) {
  const raw = req.nextUrl.searchParams.get("redirect") || ""
  const safePath = resolveSafeInternalRedirect(raw)
  if (safePath) {
    return new URL(safePath, req.url)
  }

  const last = req.cookies.get("lastWorkspaceSlug")?.value || ""
  if (last) {
    return new URL(`/workspaces/${last}`, req.url)
  }

  if (options?.includeStartFallback) {
    return new URL("/start", req.url)
  }

  return null
}

export function handleAuthRedirects(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (pathname.startsWith("/auth/sign-in") || pathname.startsWith("/auth/sign-up")) {
    const sessionCookie = getSessionCookie(req)
    if (sessionCookie) {
      const url = resolveSignedInDestination(req, { includeStartFallback: true })
      if (url) return NextResponse.redirect(url)
    }
  }
  return null
}

export function handleStartRedirect(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  if (pathname === "/start") {
    const sessionCookie = getSessionCookie(req)
    if (sessionCookie) {
      const url = resolveSignedInDestination(req)
      if (url) return NextResponse.redirect(url)
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
      url.searchParams.set("redirect", `${pathname}${req.nextUrl.search}`)
      return NextResponse.redirect(url)
    }
  }
  return null
}

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname
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
    return NextResponse.next()
  }

  if (pathname.startsWith("/auth/sign-in") || pathname.startsWith("/auth/sign-up")) {
    const sessionCookie = getSessionCookie(req)
    if (sessionCookie) {
      const raw = req.nextUrl.searchParams.get("redirect") || ""
      if (raw.startsWith("/")) {
        const url = new URL(raw, req.url)
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

  if (pathname === "/start") {
    const sessionCookie = getSessionCookie(req)
    if (sessionCookie) {
      const raw = req.nextUrl.searchParams.get("redirect") || ""
      if (raw.startsWith("/")) {
        const url = new URL(raw, req.url)
        return NextResponse.redirect(url)
      }
      const last = req.cookies.get("lastWorkspaceSlug")?.value || ""
      if (last) {
        const url = new URL(`/workspaces/${last}`, req.url)
        return NextResponse.redirect(url)
      }
    }
  }

  if (!isMainDomain && hostNoPort.startsWith("feedback.")) {
    const baseHost = hostNoPort.replace(/^feedback\./, "")
    const protoDomain = `https://${baseHost}`
    try {
      const [wsByCustom] = await db
        .select({ slug: workspace.slug })
        .from(workspace)
        .where(eq(workspace.customDomain, hostNoPort))
        .limit(1)
      let targetSlug = wsByCustom?.slug
      if (!targetSlug) {
        const [wsByDomain] = await db
          .select({ slug: workspace.slug })
          .from(workspace)
          .where(eq(workspace.domain, protoDomain))
          .limit(1)
        targetSlug = wsByDomain?.slug
      }
      if (targetSlug) {
        if (pathname === "/") {
          const url = req.nextUrl.clone()
          const label = "feedback"
          url.pathname = `/${label}/${targetSlug}`
          return NextResponse.rewrite(url)
        }
        return NextResponse.next()
      }
    } catch {}
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
  matcher: ["/", "/workspaces/:path*", "/auth/:path*", "/start"],
}


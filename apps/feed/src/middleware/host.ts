import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export const reservedSubdomains = new Set(["www", "app", "oreilla", "feedgot" ,"staging"])

export function getHostInfo(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const host = req.headers.get("host") || ""
  const hostNoPort = host.replace(/:\d+$/, "")
  const parts = hostNoPort.split(".")
  const isLocal = parts[parts.length - 1] === "localhost"
  const isMainDomain = hostNoPort.endsWith(".oreilla.com")
  const hasSub = (isLocal && parts.length >= 2) || (isMainDomain && parts.length >= 3)
  const subdomain = hasSub ? parts[0] : ""
  return { pathname, hostNoPort, isLocal, isMainDomain, subdomain }
}

export function rewriteSubdomain(req: NextRequest, ctx: ReturnType<typeof getHostInfo>) {
  const { pathname, subdomain } = ctx
  if (subdomain && !reservedSubdomains.has(subdomain)) {
    if (pathname === "/") {
      const url = req.nextUrl.clone()
      url.pathname = `/${subdomain}/${subdomain}`
      return NextResponse.rewrite(url)
    }
    if (pathname === "/roadmap") {
      const url = req.nextUrl.clone()
      url.pathname = `/${subdomain}/roadmap`
      return NextResponse.rewrite(url)
    }
    if (pathname === "/changelog") {
      const url = req.nextUrl.clone()
      url.pathname = `/${subdomain}/changelog`
      return NextResponse.rewrite(url)
    }
    if (pathname.startsWith("/board/")) {
      const url = req.nextUrl.clone()
      url.pathname = `/${subdomain}${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }
  return null
}

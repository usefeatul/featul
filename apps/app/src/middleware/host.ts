import type { NextRequest } from "next/server"
import { reroute } from "./reroute"

/** Subdomains that must stay on the main app, not tenant public sites. */
export const reservedSubdomains = new Set(["www", "app", "featul", "feedgot", "staging"])

/** Host, tenant slug, and whether this is localhost vs *.featul.com. */
export function getHostInfo(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const host = req.headers.get("host") || ""
  const hostNoPort = host.replace(/:\d+$/, "")
  const parts = hostNoPort.split(".")
  const isLocal = parts[parts.length - 1] === "localhost"
  const isMainDomain = hostNoPort.endsWith(".featul.com")
  const hasSub = (isLocal && parts.length >= 2) || (isMainDomain && parts.length >= 3)
  const subdomain = hasSub ? parts[0] : ""
  return { pathname, hostNoPort, isLocal, isMainDomain, subdomain }
}

/** Workspace-subdomain traffic: rewrite public paths onto `/{slug}/…`. Reserved hosts skip. */
export function rewriteSubdomain(req: NextRequest, ctx: ReturnType<typeof getHostInfo>) {
  const { pathname, subdomain } = ctx
  if (subdomain && !reservedSubdomains.has(subdomain)) {
    return reroute(req, subdomain, pathname)
  }
  return null
}

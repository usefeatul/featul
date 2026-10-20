import type { NextRequest } from "next/server"
import { isIP } from "node:net"
import { reroute } from "./reroute"

/** Subdomains that must stay on the main app, not tenant public sites. */
export const reservedSubdomains = new Set(["www", "app", "featul", "feedgot", "staging"])

/** Host, tenant slug, and whether this is localhost vs *.featul.com. */
export function getHostInfo(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const host = req.headers.get("host") || ""
  const hostNoPort = host.replace(/:\d+$/, "").toLowerCase()
  const parts = hostNoPort.split(".")
  const isLocalhost = parts[parts.length - 1] === "localhost"
  const isLocal = isLocalhost || isIP(hostNoPort.replace(/^\[|\]$/g, "")) !== 0
  const isMainDomain = hostNoPort === "featul.com" || hostNoPort.endsWith(".featul.com")
  const hasSub = (isLocalhost && parts.length >= 2) || (isMainDomain && parts.length >= 3)
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

import { db, workspace, workspaceDomain } from "@featul/db"
import { isSelfHosted } from "@featul/auth/selfhost"
import { and, eq } from "drizzle-orm"
import { ROOT_DOMAIN } from "@/config/domain"
import { reservedSubdomains } from "@/middleware/host"

export const runtime = "nodejs"

/**
 * Caddy's on-demand TLS `ask` hook (selfhost/Caddyfile): 200 lets Caddy issue a certificate
 * for `?domain=`, anything else refuses. Only hosts this install serves pass, so strangers
 * can't point DNS at the server and burn its Let's Encrypt rate limit.
 */
export async function GET(request: Request) {
  if (!isSelfHosted()) return new Response(null, { status: 404 })
  const domain = (new URL(request.url).searchParams.get("domain") || "").trim().toLowerCase()
  if (!domain) return new Response(null, { status: 400 })
  return new Response(null, { status: (await servesHost(domain)) ? 200 : 403 })
}

async function servesHost(domain: string) {
  if (domain === ROOT_DOMAIN) return true
  if (domain.endsWith(`.${ROOT_DOMAIN}`)) {
    const label = domain.slice(0, -ROOT_DOMAIN.length - 1)
    if (label.includes(".")) return false
    if (reservedSubdomains.has(label)) return true
    const [row] = await db.select({ id: workspace.id }).from(workspace).where(eq(workspace.slug, label)).limit(1)
    return Boolean(row)
  }
  const [row] = await db
    .select({ id: workspaceDomain.id })
    .from(workspaceDomain)
    .where(and(eq(workspaceDomain.host, domain), eq(workspaceDomain.status, "verified")))
    .limit(1)
  return Boolean(row)
}

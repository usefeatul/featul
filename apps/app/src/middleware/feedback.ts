import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { reroute } from "./reroute"
import type { getHostInfo } from "./host"

/** Resolve a custom host only via a DNS-verified workspaceDomain row. */
async function findWorkspaceSlugForFeedbackHost(hostNoPort: string) {
  const { db, workspace, workspaceDomain } = await import("@featul/db")
  const host = hostNoPort.toLowerCase()
  const [row] = await db
    .select({ slug: workspace.slug })
    .from(workspaceDomain)
    .innerJoin(workspace, eq(workspaceDomain.workspaceId, workspace.id))
    .where(
      and(
        eq(workspaceDomain.host, host),
        eq(workspaceDomain.status, "verified"),
      ),
    )
    .limit(1)
  return row?.slug || ""
}

/** A verified custom host (not featul.com): rewrite public paths onto the matched workspace. */
export async function rewriteFeedback(req: NextRequest, ctx: ReturnType<typeof getHostInfo>) {
  const { pathname, hostNoPort, isMainDomain, isLocal } = ctx
  if (!isMainDomain && !isLocal) {
    try {
      const targetSlug = await findWorkspaceSlugForFeedbackHost(hostNoPort)
      if (targetSlug) {
        return reroute(req, targetSlug, pathname)
      }
    } catch {
      return NextResponse.next()
    }
  }
  return null
}

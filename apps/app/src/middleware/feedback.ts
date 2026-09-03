import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { db, workspace, workspaceDomain } from "@featul/db"
import { and, eq } from "drizzle-orm"
import { reroute } from "./reroute"

/** Resolve a `feedback.` host only via a DNS-verified workspaceDomain row. */
async function findWorkspaceSlugForFeedbackHost(hostNoPort: string) {
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

/** `feedback.*` (not featul.com): rewrite public paths onto the matched workspace. Lookup failure continues. */
export async function rewriteFeedback(req: NextRequest, ctx: { pathname: string; hostNoPort: string; isMainDomain: boolean }) {
  const { pathname, hostNoPort, isMainDomain } = ctx
  if (!isMainDomain && hostNoPort.startsWith("feedback.")) {
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

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { db, workspace } from "@featul/db"
import { eq } from "drizzle-orm"
import { reroute } from "./reroute"

async function findWorkspaceSlugForFeedbackHost(hostNoPort: string) {
  const baseHost = hostNoPort.replace(/^feedback\./, "")
  const protoDomain = `https://${baseHost}`
  const [wsByCustom] = await db
    .select({ slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.customDomain, hostNoPort.toLowerCase()))
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
  if (!targetSlug) {
    const [wsByDomainNoProto] = await db
      .select({ slug: workspace.slug })
      .from(workspace)
      .where(eq(workspace.domain, baseHost))
      .limit(1)
    targetSlug = wsByDomainNoProto?.slug
  }
  if (!targetSlug) {
    const [wsByDomainTrailing] = await db
      .select({ slug: workspace.slug })
      .from(workspace)
      .where(eq(workspace.domain, `${protoDomain}/`))
      .limit(1)
    targetSlug = wsByDomainTrailing?.slug
  }
  return targetSlug || ""
}

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

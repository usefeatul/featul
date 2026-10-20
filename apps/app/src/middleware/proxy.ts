import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { rewriteSubdomain, getHostInfo } from "./host"
import { enforceWorkspaceAuth } from "./auth"
import { rewriteFeedback } from "./feedback"

/**
 * First matching rewrite/redirect wins: subdomain, feedback host, then /workspaces auth.
 * Auth pages and /start validate sessions themselves; cookie presence can be stale.
 * Unmatched requests continue.
 */
export async function middleware(req: NextRequest) {
  const ctx = getHostInfo(req)
  const r0 = rewriteSubdomain(req, ctx); if (r0) return r0
  const r3 = await rewriteFeedback(req, ctx); if (r3) return r3
  const r4 = enforceWorkspaceAuth(req); if (r4) return r4
  return NextResponse.next()
}

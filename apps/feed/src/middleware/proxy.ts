import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { rewriteSubdomain, getHostInfo } from "./host"
import { handleAuthRedirects, handleStartRedirect, enforceWorkspaceAuth } from "./auth"
import { rewriteFeedback } from "./feedback"

export async function middleware(req: NextRequest) {
  const ctx = getHostInfo(req)
  const r0 = rewriteSubdomain(req, ctx); if (r0) return r0
  const r1 = handleAuthRedirects(req); if (r1) return r1
  const r2 = handleStartRedirect(req); if (r2) return r2
  const r3 = await rewriteFeedback(req, ctx); if (r3) return r3
  const r4 = enforceWorkspaceAuth(req); if (r4) return r4
  return NextResponse.next()
}


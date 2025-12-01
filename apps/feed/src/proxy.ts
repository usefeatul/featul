import type { NextRequest } from "next/server"
import { middleware as proxyMiddleware } from "./middleware/proxy"

export async function proxy(req: NextRequest) {
  return proxyMiddleware(req)
}

export const config = {
  matcher: ["/", "/roadmap", "/changelog", "/workspaces/:path*", "/auth/:path*", "/start"],
}


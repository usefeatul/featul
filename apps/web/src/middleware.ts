import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const CANONICAL_HOST = "featul.com"
const LEGACY_HOSTS = new Set(["www.featul.com"])

export function middleware(request: NextRequest) {
  const { nextUrl } = request

  if (!LEGACY_HOSTS.has(nextUrl.hostname)) {
    return NextResponse.next()
  }

  const redirectUrl = nextUrl.clone()
  redirectUrl.hostname = CANONICAL_HOST
  redirectUrl.protocol = "https"

  return NextResponse.redirect(redirectUrl, 308)
}

export const config = {
  matcher: "/:path*",
}

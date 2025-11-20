import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@feedgot/auth/auth"

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith("/dashboard")) {
    try {
      const session = await auth.api.getSession({ headers: req.headers })
      if (!session?.user) {
        const url = new URL("/auth/sign-in", req.url)
        url.searchParams.set("redirect", pathname)
        return NextResponse.redirect(url)
      }
    } catch {
      const url = new URL("/auth/sign-in", req.url)
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
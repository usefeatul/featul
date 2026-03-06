import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function rewriteTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.rewrite(url);
}

export function reroute(
  req: NextRequest,
  slug: string,
  pathname: string
) {
  if (pathname === "/") {
    return rewriteTo(req, `/${slug}/${slug}`);
  }
  if (pathname === "/roadmap") {
    return rewriteTo(req, `/${slug}/roadmap`);
  }
  if (pathname === "/changelog") {
    return rewriteTo(req, `/${slug}/changelog`);
  }
  if (pathname.startsWith("/changelog/")) {
    return rewriteTo(req, `/${slug}${pathname}`);
  }
  if (pathname.startsWith("/board/")) {
    return rewriteTo(req, `/${slug}${pathname}`);
  }
  return NextResponse.next();
}

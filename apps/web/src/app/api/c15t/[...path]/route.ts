import type { NextRequest } from "next/server";
import { boundedBody, consentHeaders, consentTarget } from "@/lib/consent";

export const dynamic = "force-dynamic";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const base = process.env.C15T_URL || process.env.NEXT_PUBLIC_C15T_URL;
  if (!base) return Response.json({ error: "Consent service unavailable" }, { status: 503 });
  let target: URL;
  try {
    target = consentTarget(base, (await params).path, request.nextUrl.search);
  } catch {
    return Response.json({ error: "Invalid consent path" }, { status: 400 });
  }
  try {
    const body = request.method === "GET" || request.method === "HEAD"
      ? undefined : await boundedBody(request.body);
    const upstream = await fetch(target, {
      method: request.method,
      headers: consentHeaders(request.headers),
      body: body as BodyInit | undefined,
      redirect: "manual",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(10_000)]),
    });
    // Do not relay upstream redirects, cookies, or credentialed CORS headers.
    if (upstream.status >= 300 && upstream.status < 400) {
      await upstream.body?.cancel();
      return Response.json({ error: "Invalid consent response" }, { status: 502 });
    }
    const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    headers.set("Content-Type", upstream.headers.get("content-type") || "application/json");
    const responseBody = await boundedBody(upstream.body);
    return new Response(request.method === "HEAD" || [204, 205, 304].includes(upstream.status) ? null : responseBody as BodyInit, {
      status: upstream.status, headers,
    });
  } catch (error) {
    const status = error instanceof RangeError ? 413 : error instanceof Error && error.name === "TimeoutError" ? 504 : 502;
    return Response.json({ error: "Consent request failed" }, { status });
  }
}

export { proxyRequest as GET, proxyRequest as POST, proxyRequest as PUT, proxyRequest as PATCH,
  proxyRequest as DELETE, proxyRequest as OPTIONS, proxyRequest as HEAD };

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM_ENV_KEYS = ["C15T_URL", "NEXT_PUBLIC_C15T_URL"] as const;
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getUpstreamBaseUrl() {
  for (const key of UPSTREAM_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      return value.replace(/\/+$/, "");
    }
  }

  return null;
}

function buildUpstreamHeaders(request: NextRequest) {
  const headers = new Headers(request.headers);

  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }

  return headers;
}

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const upstreamBaseUrl = getUpstreamBaseUrl();

  if (!upstreamBaseUrl) {
    return Response.json(
      {
        error: "Missing c15t backend URL. Set C15T_URL or NEXT_PUBLIC_C15T_URL.",
      },
      { status: 500 }
    );
  }

  const { path } = await params;
  const targetUrl = new URL(`${path.join("/")}${request.nextUrl.search}`, `${upstreamBaseUrl}/`);

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: buildUpstreamHeaders(request),
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}

import { eq } from "drizzle-orm";
import { workspace, workspaceDomain } from "@featul/db";
import { buildWidgetOriginAllowlist } from "../../shared/identity";

type WidgetDb = {
  select: (...args: any[]) => any;
};

export type WidgetOriginSource = {
  slug: string;
  domain: string | null;
  customDomain: string | null;
  widgetAllowedOrigins: unknown;
};

/** The sites allowed to embed a workspace's widget (and call its API). */
export function widgetAllowedOrigins(
  ws: WidgetOriginSource,
  domains: Array<{ host: string; status: string }>,
): string[] {
  return buildWidgetOriginAllowlist({
    slug: ws.slug,
    workspaceDomain: ws.domain,
    customDomain: ws.customDomain,
    verifiedHosts: domains
      .filter((row) => row.status === "verified")
      .map((row) => row.host),
    appOrigin:
      process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || null,
    configuredOrigins: Array.isArray(ws.widgetAllowedOrigins)
      ? ws.widgetAllowedOrigins.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    includeDevOrigins: process.env.NODE_ENV !== "production",
  });
}

/** Lightweight lookup for the widget frame's CSP. Null when the project is unknown. */
export async function loadWidgetAllowedOrigins(
  db: WidgetDb,
  projectId: string,
): Promise<string[] | null> {
  const [ws] = (await db
    .select({
      id: workspace.id,
      slug: workspace.slug,
      domain: workspace.domain,
      customDomain: workspace.customDomain,
      widgetAllowedOrigins: workspace.widgetAllowedOrigins,
    })
    .from(workspace)
    .where(eq(workspace.id, projectId))
    .limit(1)) as Array<WidgetOriginSource & { id: string }>;
  if (!ws) return null;

  const domains = (await db
    .select({ host: workspaceDomain.host, status: workspaceDomain.status })
    .from(workspaceDomain)
    .where(eq(workspaceDomain.workspaceId, ws.id))) as Array<{
    host: string;
    status: string;
  }>;

  return widgetAllowedOrigins(ws, domains);
}

const CSP_ORIGIN_PATTERN = /^https?:\/\/[a-z0-9.-]+(?::\d{1,5})?$/;

/**
 * `frame-ancestors` source list for the widget frame. Only strict
 * scheme://host[:port] origins are emitted so stored domains can never inject
 * extra CSP directives.
 */
export function widgetFrameAncestors(origins: string[]): string {
  const sources = new Set<string>(["'self'"]);
  for (const origin of origins) {
    const value = String(origin || "").trim().toLowerCase();
    if (CSP_ORIGIN_PATTERN.test(value)) sources.add(value);
  }
  return [...sources].join(" ");
}

/**
 * Browser Origin of a cross-origin widget API call, or null for same-origin
 * calls. The widget iframe runs on the app origin, so its own calls are
 * same-origin; a different Origin means a page called the API directly and
 * must be on the workspace's widget allowlist (see resolveWidget).
 */
export function foreignRequestOrigin(req: Request | null): string | null {
  if (!req) return null;
  const raw = (req.headers.get("origin") || "").trim();
  if (!raw) return null;
  // Opaque origins (sandboxed frames, file://) can never match an allowlist.
  if (raw === "null") return "null";
  let origin: string;
  try {
    origin = new URL(raw).origin;
  } catch {
    return "null";
  }
  try {
    if (origin === new URL(req.url).origin) return null;
  } catch {
    /* fall through: treat as foreign */
  }
  return origin;
}

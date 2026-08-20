import { HTTPException } from "hono/http-exception";
import { enforceTrustedBrowserOrigin } from "../request/origin";
import { limitPrivate } from "../services/ratelimiter";

type ChangelogAiSession = {
  user: { id: string };
  session?: { token?: string };
};

export type AuthorizedChangelogAiRequest = {
  session: ChangelogAiSession;
  rateLimit: Awaited<ReturnType<typeof limitPrivate>>;
};

const PRIVATE_JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
} as const;

export function changelogAiJsonResponse(
  status: number,
  body: { message: string },
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...PRIVATE_JSON_HEADERS, ...extraHeaders },
  });
}

/**
 * Authenticated-only gate for the changelog AI stream endpoint.
 * Requires POST, a trusted browser origin, a valid session, and private rate limits.
 */
export async function authorizePrivateChangelogAiRequest(
  req: Request,
): Promise<Response | AuthorizedChangelogAiRequest> {
  if (req.method !== "POST") {
    return changelogAiJsonResponse(405, { message: "Method not allowed" });
  }

  try {
    enforceTrustedBrowserOrigin(req);
  } catch (err) {
    const message =
      err instanceof HTTPException ? err.message : "Invalid request origin";
    const status = err instanceof HTTPException ? err.status : 403;
    return changelogAiJsonResponse(status, { message });
  }

  const session = await import("@featul/auth/auth").then(({ auth }) =>
    auth.api.getSession({ headers: req.headers }),
  );

  if (!session?.user?.id) {
    return changelogAiJsonResponse(401, { message: "Unauthorized" });
  }

  const rateLimit = await limitPrivate(req, session.user.id);
  if (!rateLimit.success) {
    return changelogAiJsonResponse(
      429,
      { message: "Too Many Requests" },
      { "Retry-After": String(Math.max(1, rateLimit.reset)) },
    );
  }

  return {
    session: session as ChangelogAiSession,
    rateLimit,
  };
}

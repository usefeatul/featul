import { client } from "@featul/api/client";
import { safeJson } from "@/lib/api-response";
import { normalizeRedirectParam } from "@/utils/redirect";

type WorkspaceListResponse = {
  workspaces?: { slug: string }[];
};

const START_PATH = "/start";

/**
 * Resolve where to send a user immediately after sign-in, sign-up verify, etc.
 * New users with no workspace always go to /start (workspace setup + welcome tour).
 */
export async function resolvePostAuthPath(
  rawRedirect?: string,
): Promise<string> {
  const safeRedirect = normalizeRedirectParam(rawRedirect || "");

  try {
    const res = await client.workspace.listMine.$get();
    const data = await safeJson<WorkspaceListResponse>(res);
    const workspaces = Array.isArray(data?.workspaces) ? data.workspaces : [];

    if (workspaces.length === 0) {
      return START_PATH;
    }

    const firstSlug = workspaces[0]?.slug;
    const defaultWorkspacePath = firstSlug
      ? `/workspaces/${firstSlug}`
      : START_PATH;

    if (!safeRedirect || safeRedirect === START_PATH) {
      return defaultWorkspacePath;
    }

    return safeRedirect;
  } catch {
    return safeRedirect || START_PATH;
  }
}

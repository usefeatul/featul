import { normalizeInternalRedirectPath } from "@/utils/path";

/** Returns a same-origin path or null if the redirect is unsafe. */
export function resolveSafeInternalRedirect(raw: string): string | null {
  const safePath = normalizeInternalRedirectPath(raw);
  return safePath || null;
}

/** Safe redirect, else first accessible workspace, else /start. */
export async function resolveAuthenticatedAppPath(
  userId: string,
  rawRedirect: string
): Promise<string> {
  const safePath = resolveSafeInternalRedirect(rawRedirect);
  if (safePath) return safePath;

  const { findFirstAccessibleWorkspaceSlug } = await import("@/lib/workspace");
  const slug = await findFirstAccessibleWorkspaceSlug(userId);
  return slug ? `/workspaces/${slug}` : "/start";
}

import { normalizeInternalRedirectPath } from "@/utils/path";

export function resolveSafeInternalRedirect(raw: string): string | null {
  const safePath = normalizeInternalRedirectPath(raw);
  return safePath || null;
}

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

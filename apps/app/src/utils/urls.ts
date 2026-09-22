const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").trim();

/** Prefix `path` with NEXT_PUBLIC_APP_URL. Falls back to a root-relative path. */
export function getAppUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = APP_URL.replace(/\/+$/, "");
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

/** Signed-in landing URL (`/start`). */
export function getDashboardUrl(): string {
  return getAppUrl("/start");
}

/** Workspace dashboard URL. Slug is URI-encoded. */
export function getWorkspaceDashboardUrl(workspaceSlug: string): string {
  return getAppUrl(`/workspaces/${encodeURIComponent(workspaceSlug)}`);
}

/** New-workspace flow URL. */
export function getCreateProjectUrl(): string {
  return getAppUrl("/workspaces/new");
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").trim();

export function getAppUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = APP_URL.replace(/\/+$/, "");
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

export function getDashboardUrl(): string {
  return getAppUrl("/start");
}

export function getWorkspaceDashboardUrl(workspaceSlug: string): string {
  return getAppUrl(`/workspaces/${encodeURIComponent(workspaceSlug)}`);
}

export function getCreateProjectUrl(): string {
  return getAppUrl("/workspaces/new");
}

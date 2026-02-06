const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

export function getAppUrl(path: string): string {
  return `${APP_URL}${path}`;
}

export function getDashboardUrl(): string {
  return getAppUrl("/start");
}

export function getCreateProjectUrl(): string {
  return getAppUrl("/workspaces/new");
}

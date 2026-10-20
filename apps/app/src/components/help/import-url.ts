/** Search params the drafting dialog reads on the help page; closing it clears them all. */
export const HELP_IMPORT_PARAMS = ["import", "site", "repo", "start", "onboarding"] as const;

/**
 * Help page URL that opens the "Draft from website" dialog. `params` can prefill `site` and
 * `repo`, auto-start the scan (`start: "1"`) or mark the post-setup flow (`onboarding: "1"`).
 */
export function helpImportHref(workspaceSlug: string, params?: Record<string, string>) {
  const search = new URLSearchParams({ import: "1", ...params });
  return `/workspaces/${workspaceSlug}/help?${search.toString()}`;
}

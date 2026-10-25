import type { StatusKey } from "../shared/status";

export type GithubStatusSettings = {
  openStatus: "review" | "planned";
  progressLabels: string[];
};

export const DEFAULT_GITHUB_STATUS_SETTINGS: GithubStatusSettings = {
  openStatus: "planned",
  progressLabels: ["in progress"],
};

const normalizeLabel = (label: string) => label.trim().toLowerCase().replace(/[\s_-]+/g, " ");

/**
 * Roadmap status for a linked issue:
 * closed as completed → completed, closed any other way → closed,
 * open with a progress label → progress, otherwise the workspace's open status.
 */
export function roadmapStatusForIssue(
  issue: { state: "open" | "closed"; stateReason: string | null; labels: string[] },
  settings: GithubStatusSettings,
): StatusKey {
  if (issue.state === "closed") {
    // Issues closed before GitHub tracked reasons have no state_reason; treat them as done.
    return issue.stateReason === "not_planned" || issue.stateReason === "duplicate" ? "closed" : "completed";
  }
  const progress = new Set(settings.progressLabels.map(normalizeLabel).filter(Boolean));
  if (issue.labels.some((label) => progress.has(normalizeLabel(label)))) return "progress";
  return settings.openStatus;
}

export type RequestRef =
  | { kind: "public"; host: string; postSlug: string }
  | { kind: "app"; workspaceSlug: string; postSlug: string };

const REQUEST_URL_REGEX =
  /https?:\/\/([a-z0-9.-]+(?::\d+)?)\/(?:board\/p\/([a-z0-9-]+)|workspaces\/([a-z0-9-]+)\/requests\/([a-z0-9-]+))/gi;
const MAX_REFS = 20;

/**
 * Featul request links in an issue description: public portal links (`acme.featul.com/board/p/x`
 * or a custom domain) and app links (`app.featul.com/workspaces/acme/requests/x`).
 */
export function extractRequestRefs(body: string | null | undefined): RequestRef[] {
  const refs = new Map<string, RequestRef>();
  for (const match of String(body ?? "").slice(0, 65_536).matchAll(REQUEST_URL_REGEX)) {
    const host = (match[1] ?? "").toLowerCase();
    const ref: RequestRef = match[2]
      ? { kind: "public", host, postSlug: match[2].toLowerCase() }
      : { kind: "app", workspaceSlug: (match[3] ?? "").toLowerCase(), postSlug: (match[4] ?? "").toLowerCase() };
    refs.set(JSON.stringify(ref), ref);
    if (refs.size >= MAX_REFS) break;
  }
  return [...refs.values()];
}

/** Whether a link points at this workspace: its subdomain, its custom domain, or its app pages. */
export function refBelongsTo(ref: RequestRef, ws: { slug: string; customDomain: string | null }) {
  const slug = ws.slug.toLowerCase();
  if (ref.kind === "app") return ref.workspaceSlug === slug;
  const hostname = ref.host.replace(/:\d+$/, "");
  return (
    hostname === `${slug}.featul.com` ||
    hostname === `${slug}.localhost` ||
    (Boolean(ws.customDomain) && hostname === ws.customDomain!.toLowerCase())
  );
}

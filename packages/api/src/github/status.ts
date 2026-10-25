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
  | { kind: "app"; host: string; workspaceSlug: string; postSlug: string };

// A slug must end at a real boundary, so `/board/p/foo_bar` never matches a request called `foo`.
const SLUG_END = "(?=$|[/?#)\\]\\s<>\"'.,;:!])";
const REQUEST_URL_REGEX = new RegExp(
  `https?://([a-z0-9.-]+(?::\\d+)?)/(?:board/p/([a-z0-9-]+)${SLUG_END}|workspaces/([a-z0-9-]+)/requests/([a-z0-9-]+)${SLUG_END})`,
  "gi",
);
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
      : { kind: "app", host, workspaceSlug: (match[3] ?? "").toLowerCase(), postSlug: (match[4] ?? "").toLowerCase() };
    refs.set(JSON.stringify(ref), ref);
    if (refs.size >= MAX_REFS) break;
  }
  return [...refs.values()];
}

/** Hosts that serve the Featul app's `/workspaces/...` pages. */
export function featulAppHosts(): string[] {
  const hosts = new Set(["app.featul.com"]);
  for (const value of [process.env.NEXT_PUBLIC_APP_URL, process.env.BETTER_AUTH_URL]) {
    try {
      if (value) hosts.add(new URL(value).hostname.toLowerCase());
    } catch {
      // Not a URL; ignore.
    }
  }
  return [...hosts];
}

/**
 * Whether a link points at this workspace: its subdomain or custom domain for public links,
 * or the Featul app's own host for `/workspaces/<slug>/requests/...` links.
 */
export function refBelongsTo(
  ref: RequestRef,
  ws: { slug: string; customDomain: string | null },
  appHosts: string[] = featulAppHosts(),
) {
  const slug = ws.slug.toLowerCase();
  const hostname = ref.host.replace(/:\d+$/, "");
  if (ref.kind === "app") {
    return ref.workspaceSlug === slug && (appHosts.includes(hostname) || hostname === "localhost");
  }
  return (
    hostname === `${slug}.featul.com` ||
    hostname === `${slug}.localhost` ||
    (Boolean(ws.customDomain) && hostname === ws.customDomain!.toLowerCase())
  );
}

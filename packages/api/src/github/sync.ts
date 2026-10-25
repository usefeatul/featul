import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { activityLog, board, githubIssueLink, githubSyncSettings, helpCenter, post, workspace } from "@featul/db";
import { ACTIVITY_ACTIONS } from "../activity/actions";
import { clearHelpGithubConnection, getHelpGithubConnection } from "../help/import/github";
import {
  getRepoPermission,
  listRepoIssues,
  toGithubIssue,
  type GithubIssue,
  type ListedIssue,
  type RawIssue,
} from "../services/github-app";
import { getWorkspaceAccessPlan } from "../shared/access";
import { isIntegrationsAllowed } from "../shared/plan";
import { normalizeStatus } from "../shared/status";
import { notifyPostStatusChange } from "../status/notify";

/** A voter email for a status change; callers send these after responding. */
export type StatusNotification = Parameters<typeof notifyPostStatusChange>[0];
export type Notify = (notification: StatusNotification) => void;
import {
  DEFAULT_GITHUB_STATUS_SETTINGS,
  extractRequestRefs,
  featulAppHosts,
  refBelongsTo,
  roadmapStatusForIssue,
  type GithubStatusSettings,
} from "./status";

type Db = any;

export type SyncSettings = GithubStatusSettings & { autoStatus: boolean };

export async function getSyncSettings(db: Db, workspaceId: string): Promise<SyncSettings> {
  const [row] = await db
    .select()
    .from(githubSyncSettings)
    .where(eq(githubSyncSettings.workspaceId, workspaceId))
    .limit(1);
  return {
    // Off until someone turns it on, so connecting GitHub (e.g. for Help Center) never
    // starts changing statuses and emailing voters by itself.
    autoStatus: row?.autoStatus ?? false,
    openStatus: row?.openStatus ?? DEFAULT_GITHUB_STATUS_SETTINGS.openStatus,
    progressLabels: row?.progressLabels ?? DEFAULT_GITHUB_STATUS_SETTINGS.progressLabels,
  };
}

export async function saveSyncSettings(db: Db, workspaceId: string, input: SyncSettings) {
  const seen = new Set<string>();
  const progressLabels = input.progressLabels
    .map((label) => label.trim())
    .filter((label) => label && !seen.has(label.toLowerCase()) && seen.add(label.toLowerCase()));
  const settings = { autoStatus: input.autoStatus, openStatus: input.openStatus, progressLabels };
  await db
    .insert(githubSyncSettings)
    .values({ workspaceId, ...settings })
    .onConflictDoUpdate({ target: githubSyncSettings.workspaceId, set: { ...settings, updatedAt: new Date() } });
}

export const LINKS_PAGE_SIZE = 50;

/** Linked issues for the settings list, newest first, a page at a time. */
export async function listIssueLinks(db: Db, workspaceId: string, offset = 0) {
  const rows = await db
    .select({
      total: sql<number>`count(*) over()`.mapWith(Number),
      id: githubIssueLink.id,
      repoFullName: githubIssueLink.repoFullName,
      issueNumber: githubIssueLink.issueNumber,
      title: githubIssueLink.title,
      url: githubIssueLink.url,
      state: githubIssueLink.state,
      stateReason: githubIssueLink.stateReason,
      postTitle: post.title,
      postSlug: post.slug,
      roadmapStatus: post.roadmapStatus,
    })
    .from(githubIssueLink)
    .innerJoin(post, eq(githubIssueLink.postId, post.id))
    .where(eq(githubIssueLink.workspaceId, workspaceId))
    .orderBy(desc(githubIssueLink.createdAt), desc(githubIssueLink.id))
    .limit(LINKS_PAGE_SIZE)
    .offset(offset);
  const total: number = rows[0]?.total ?? 0;
  return {
    links: rows.map(({ total: _total, ...row }: { total: number }) => row),
    total,
    nextOffset: offset + rows.length < total ? offset + rows.length : null,
  };
}

export async function unlinkIssue(db: Db, workspaceId: string, linkId: string) {
  const deleted = await db
    .delete(githubIssueLink)
    .where(and(eq(githubIssueLink.id, linkId), eq(githubIssueLink.workspaceId, workspaceId)))
    .returning({ id: githubIssueLink.id });
  return deleted.length > 0;
}

/** Sets a post's roadmap status from GitHub, logging it and emailing voters like a manual change. */
async function applyStatus(
  db: Db,
  input: { workspaceId: string; postId: string; issue: GithubIssue; settings: SyncSettings; notify: Notify },
) {
  if (!input.settings.autoStatus) return null;
  const [current] = await db
    .select({ id: post.id, title: post.title, roadmapStatus: post.roadmapStatus, boardId: post.boardId, slug: post.slug })
    .from(post)
    .where(eq(post.id, input.postId))
    .limit(1);
  if (!current) return null;

  const toStatus = roadmapStatusForIssue(input.issue, input.settings);
  const fromStatus = current.roadmapStatus;
  if (normalizeStatus(fromStatus || "pending") === toStatus) return null;

  await db.update(post).set({ roadmapStatus: toStatus, updatedAt: new Date() }).where(eq(post.id, current.id));
  await db.insert(activityLog).values({
    workspaceId: input.workspaceId,
    userId: null,
    action: ACTIVITY_ACTIONS.POST_META_UPDATED,
    actionType: "update",
    entity: "post",
    entityId: String(current.id),
    title: current.title,
    metadata: {
      roadmapStatus: toStatus,
      fromStatus,
      toStatus,
      boardId: current.boardId,
      slug: current.slug,
      via: "github",
      issueUrl: input.issue.url,
    },
  });
  // No Featul user made this change, so nobody is skipped as the actor.
  input.notify({ db, postId: current.id, fromStatus, toStatus, actorUserId: "" });
  return toStatus;
}

type ConnectedWorkspace = { id: string; slug: string; customDomain: string | null; settings: SyncSettings };

/**
 * Workspaces connected through `installationId` whose connecting user can access `repo` and
 * whose plan still includes integrations.
 */
async function connectedWorkspaces(db: Db, installationId: string, repo: string): Promise<ConnectedWorkspace[]> {
  const rows: Array<{ id: string; slug: string; customDomain: string | null; repos: string[] | null }> = await db
    .select({ id: workspace.id, slug: workspace.slug, customDomain: workspace.customDomain, repos: helpCenter.githubRepos })
    .from(helpCenter)
    .innerJoin(workspace, eq(helpCenter.workspaceId, workspace.id))
    .where(eq(helpCenter.githubInstallationId, installationId));
  const result: ConnectedWorkspace[] = [];
  for (const row of rows) {
    if (!row.repos?.includes(repo)) continue;
    if (!isIntegrationsAllowed(await getWorkspaceAccessPlan(row.id))) continue;
    result.push({ id: row.id, slug: row.slug, customDomain: row.customDomain, settings: await getSyncSettings(db, row.id) });
  }
  return result;
}

/** Posts in `ws` that the issue description links to; slugs shared by several boards are skipped. */
async function referencedPostIds(db: Db, ws: ConnectedWorkspace, body: string | null | undefined) {
  const appHosts = featulAppHosts();
  const slugs = [
    ...new Set(extractRequestRefs(body).filter((ref) => refBelongsTo(ref, ws, appHosts)).map((ref) => ref.postSlug)),
  ];
  if (slugs.length === 0) return [];
  const rows: Array<{ id: string; slug: string }> = await db
    .select({ id: post.id, slug: post.slug })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(eq(board.workspaceId, ws.id), inArray(post.slug, slugs)));
  const bySlug = new Map<string, string[]>();
  for (const row of rows) bySlug.set(row.slug, [...(bySlug.get(row.slug) ?? []), row.id]);
  return [...bySlug.values()].filter((ids) => ids.length === 1).map((ids) => ids[0]!);
}

export type IssuesEvent = {
  action?: string;
  installation?: { id?: number | string };
  repository?: { full_name?: string };
  sender?: { login?: string; type?: string };
  /** On `edited`, which fields changed. */
  changes?: { body?: unknown; title?: unknown };
  issue?: RawIssue & { body?: string | null; user?: { login?: string } };
};

const TRUSTED_PERMISSIONS = new Set(["admin", "maintain", "write", "triage"]);

/**
 * Whether `login` may steer linked requests: people with at least triage access, or Apps
 * (bots) that the repo's admins installed. Anyone can open, edit, and close their own issues
 * on a public repo, so issue authorship alone never counts.
 */
async function isTrusted(installationId: string, repo: string, sender: { login?: string; type?: string } | undefined) {
  if (!sender?.login) return false;
  if (sender.type === "Bot") return true;
  return TRUSTED_PERMISSIONS.has(await getRepoPermission(installationId, repo, sender.login));
}

/**
 * Brings one workspace in line with one issue. With `relink`, the description decides which
 * requests are linked (pasting a link links it, removing it unlinks); otherwise existing links
 * stay. A request already linked to another issue only moves here with `takeOver`, so two
 * issues mentioning the same request don't trade it back and forth. Linked requests then get
 * the issue's latest title/state and follow its status. Older events than the last one seen
 * for this issue are ignored.
 */
async function processIssue(
  db: Db,
  ws: ConnectedWorkspace,
  repo: string,
  raw: RawIssue & { body?: string | null },
  relink: boolean,
  notify: Notify,
  /** Move requests linked to another issue onto this one (when its description was just written). */
  takeOver: boolean,
) {
  const issue = toGithubIssue(raw, repo);
  const forIssue = and(
    eq(githubIssueLink.workspaceId, ws.id),
    eq(githubIssueLink.repoFullName, repo),
    eq(githubIssueLink.issueNumber, issue.number),
  );
  const existing: Array<{ postId: string; issueUpdatedAt: Date | null }> = await db
    .select({ postId: githubIssueLink.postId, issueUpdatedAt: githubIssueLink.issueUpdatedAt })
    .from(githubIssueLink)
    .where(forIssue);
  const seenAt = Math.max(0, ...existing.map((row) => row.issueUpdatedAt?.getTime() ?? 0));
  if (issue.updatedAt && issue.updatedAt.getTime() < seenAt) return { linked: 0, updated: 0 };
  const alreadyLinked = new Set(existing.map((row) => row.postId));

  let postIds = [...alreadyLinked];
  if (relink) {
    postIds = await referencedPostIds(db, ws, raw.body);
    // The description is the source of truth: drop links it no longer mentions.
    if (alreadyLinked.size > 0) {
      await db
        .delete(githubIssueLink)
        .where(postIds.length ? and(forIssue, notInArray(githubIssueLink.postId, postIds)) : forIssue);
    }
    if (!takeOver) {
      // Leave requests that another issue already follows where they are.
      const fresh = postIds.filter((id) => !alreadyLinked.has(id));
      if (fresh.length) {
        const taken: Array<{ postId: string }> = await db
          .select({ postId: githubIssueLink.postId })
          .from(githubIssueLink)
          .where(inArray(githubIssueLink.postId, fresh));
        const elsewhere = new Set(taken.map((row) => row.postId));
        postIds = postIds.filter((id) => !elsewhere.has(id));
      }
    }
  }

  const snapshot = {
    title: issue.title,
    url: issue.url,
    state: issue.state,
    stateReason: issue.stateReason,
    labels: issue.labels,
    issueUpdatedAt: issue.updatedAt,
    syncedAt: new Date(),
  };
  let linked = 0;
  let updated = 0;
  for (const postId of postIds) {
    // A request follows one issue; the latest issue to mention it wins.
    await db
      .insert(githubIssueLink)
      .values({ workspaceId: ws.id, postId, repoFullName: repo, issueNumber: issue.number, ...snapshot })
      .onConflictDoUpdate({
        target: githubIssueLink.postId,
        set: { repoFullName: repo, issueNumber: issue.number, ...snapshot },
      });
    if (!alreadyLinked.has(postId)) linked += 1;
    if (await applyStatus(db, { workspaceId: ws.id, postId, issue, settings: ws.settings, notify })) updated += 1;
  }
  return { linked, updated };
}

/** Actions that can change the description (links) or the status. */
const ISSUE_ACTIONS = new Set(["opened", "edited", "closed", "reopened", "labeled", "unlabeled"]);

async function hasLinksFor(db: Db, workspaceId: string, repo: string, number: number) {
  const [row] = await db
    .select({ id: githubIssueLink.id })
    .from(githubIssueLink)
    .where(
      and(
        eq(githubIssueLink.workspaceId, workspaceId),
        eq(githubIssueLink.repoFullName, repo),
        eq(githubIssueLink.issueNumber, number),
      ),
    )
    .limit(1);
  return Boolean(row);
}

/**
 * Applies a GitHub `issues` webhook to every workspace connected through the sending
 * installation that can access the repo. Only trusted senders (see `isTrusted`) change
 * anything, and links are only re-read when the description was written or changed.
 * Voter emails go to `notify` so the caller can answer GitHub first.
 */
export async function handleIssuesEvent(db: Db, event: IssuesEvent, notify: Notify) {
  const repo = String(event.repository?.full_name ?? "").toLowerCase();
  const installationId = String(event.installation?.id ?? "");
  const number = Number(event.issue?.number);
  const action = String(event.action);
  const result = { linked: 0, updated: 0, ignored: false };
  if (!repo || !installationId || !Number.isSafeInteger(number) || !event.issue) return result;
  if (action !== "deleted" && action !== "transferred" && !ISSUE_ACTIONS.has(action)) return result;

  const workspaces = await connectedWorkspaces(db, installationId, repo);
  if (workspaces.length === 0) return result;

  if (action === "deleted" || action === "transferred") {
    // Only admins can delete, and moving an issue needs write access; it's gone either way.
    for (const ws of workspaces) {
      await db
        .delete(githubIssueLink)
        .where(
          and(
            eq(githubIssueLink.workspaceId, ws.id),
            eq(githubIssueLink.repoFullName, repo),
            eq(githubIssueLink.issueNumber, number),
          ),
        );
    }
    return result;
  }

  const relink = action === "opened" || (action === "edited" && event.changes?.body !== undefined);
  const appHosts = featulAppHosts();
  const mentions = relink ? extractRequestRefs(event.issue.body) : [];
  const relevant: ConnectedWorkspace[] = [];
  for (const ws of workspaces) {
    if (mentions.some((ref) => refBelongsTo(ref, ws, appHosts)) || (await hasLinksFor(db, ws.id, repo, number))) {
      relevant.push(ws);
    }
  }
  // Most issues have nothing to do with Featul; don't spend a GitHub API call on them.
  if (relevant.length === 0) return result;

  if (!(await isTrusted(installationId, repo, event.sender))) {
    result.ignored = true;
    return result;
  }
  for (const ws of relevant) {
    const counts = await processIssue(db, ws, repo, event.issue, relink, notify, relink);
    result.linked += counts.linked;
    result.updated += counts.updated;
  }
  return result;
}

/** Repos taken out of the App installation stop syncing for every workspace using it. */
export async function handleRepositoriesRemoved(db: Db, installationId: string, removed: string[]) {
  const gone = new Set(removed.map((name) => name.toLowerCase()));
  if (gone.size === 0) return { updated: 0 };
  const rows: Array<{ workspaceId: string; repos: string[] | null }> = await db
    .select({ workspaceId: helpCenter.workspaceId, repos: helpCenter.githubRepos })
    .from(helpCenter)
    .where(eq(helpCenter.githubInstallationId, installationId));
  let updated = 0;
  for (const row of rows) {
    const repos = (row.repos ?? []).filter((repo) => !gone.has(repo));
    if (repos.length === (row.repos ?? []).length) continue;
    await db.update(helpCenter).set({ githubRepos: repos, updatedAt: new Date() }).where(eq(helpCenter.workspaceId, row.workspaceId));
    updated += 1;
  }
  return { updated };
}

/** Pages of 100 issues read per sync, across all repos (10,000 issues). */
const SYNC_MAX_PAGES = 100;

export type SyncSummary = {
  repos: number;
  issues: number;
  linked: number;
  updated: number;
  unlinked: number;
  /** Repos that had more issues than the page budget; their oldest issues weren't read. */
  truncated: string[];
  /** Repos GitHub wouldn't list (removed from the installation, renamed, or no Issues access). */
  failed: string[];
};

/**
 * Re-reads issues from GitHub for one workspace: catches webhooks GitHub never delivered and
 * links issues that mentioned requests before GitHub was connected. Repos with links go first.
 */
export async function syncWorkspaceIssues(db: Db, workspaceId: string, notify: Notify): Promise<SyncSummary> {
  const connection = await getHelpGithubConnection(db, workspaceId);
  const summary: SyncSummary = { repos: 0, issues: 0, linked: 0, updated: 0, unlinked: 0, truncated: [], failed: [] };
  if (!connection?.repos?.length) return summary;

  const [ws] = await db
    .select({ id: workspace.id, slug: workspace.slug, customDomain: workspace.customDomain })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1);
  if (!ws) return summary;
  const target: ConnectedWorkspace = { ...ws, settings: await getSyncSettings(db, workspaceId) };

  const linkedRepos: Array<{ repo: string }> = await db
    .selectDistinct({ repo: githubIssueLink.repoFullName })
    .from(githubIssueLink)
    .where(eq(githubIssueLink.workspaceId, workspaceId));
  const withLinks = new Set(linkedRepos.map((row) => row.repo));
  const repos = [...connection.repos].sort((a, b) => Number(withLinks.has(b)) - Number(withLinks.has(a)));

  let budget = SYNC_MAX_PAGES;
  for (const repo of repos) {
    if (budget <= 0) {
      summary.truncated.push(repo);
      continue;
    }
    let listed: Awaited<ReturnType<typeof listRepoIssues>>;
    try {
      listed = await listRepoIssues(connection.installationId, repo, budget);
    } catch (error) {
      console.error(`[github-sync] couldn't list issues for ${repo}`, error);
      summary.failed.push(repo);
      continue;
    }
    budget -= listed.pages;
    summary.repos += 1;
    summary.issues += listed.issues.length;
    if (!listed.complete) summary.truncated.push(repo);

    const linkedRows: Array<{ issueNumber: number }> = await db
      .selectDistinct({ issueNumber: githubIssueLink.issueNumber })
      .from(githubIssueLink)
      .where(and(eq(githubIssueLink.workspaceId, workspaceId), eq(githubIssueLink.repoFullName, repo)));
    const linkedNumbers = new Set(linkedRows.map((row) => row.issueNumber));

    const appHosts = featulAppHosts();
    for (const issue of listed.issues as ListedIssue[]) {
      // Most issues neither are linked nor mention a request: skip them without touching the database.
      const mentions = extractRequestRefs(issue.body).some((ref) => refBelongsTo(ref, target, appHosts));
      if (!linkedNumbers.has(issue.number) && !mentions) continue;
      // The listing doesn't say who last changed an issue, so only issues written by people with
      // triage access or more are applied. Others are kept up to date by webhooks.
      const author = issue.user?.login;
      if (!author || !TRUSTED_PERMISSIONS.has(await getRepoPermission(connection.installationId, repo, author))) {
        continue;
      }
      const counts = await processIssue(db, target, repo, issue, true, notify, false);
      summary.linked += counts.linked;
      summary.updated += counts.updated;
    }

    // Issues deleted or transferred away no longer show up; only trust that on a full read.
    if (listed.complete && withLinks.has(repo)) {
      const seen = listed.issues.map((issue) => issue.number);
      const removed = await db
        .delete(githubIssueLink)
        .where(
          and(
            eq(githubIssueLink.workspaceId, workspaceId),
            eq(githubIssueLink.repoFullName, repo),
            ...(seen.length ? [notInArray(githubIssueLink.issueNumber, seen)] : []),
          ),
        )
        .returning({ id: githubIssueLink.id });
      summary.unlinked += removed.length;
    }
  }
  return summary;
}

/** Sends voter emails one after another; used after the response has gone out. */
export async function sendStatusNotifications(notifications: StatusNotification[]) {
  for (const notification of notifications) await notifyPostStatusChange(notification);
}

/** The App was uninstalled on GitHub: forget it everywhere it was connected. Links stay for history. */
export async function handleInstallationDeleted(db: Db, installationId: string) {
  const rows: Array<{ workspaceId: string }> = await db
    .select({ workspaceId: helpCenter.workspaceId })
    .from(helpCenter)
    .where(eq(helpCenter.githubInstallationId, installationId));
  for (const row of rows) await clearHelpGithubConnection(db, row.workspaceId);
  return { cleared: rows.length };
}

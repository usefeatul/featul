import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { activityLog, board, githubIssueLink, githubSyncSettings, helpCenter, post, workspace } from "@featul/db";
import { ACTIVITY_ACTIONS } from "../activity/actions";
import { clearHelpGithubConnection, getHelpGithubConnection } from "../help/import/github";
import { listRepoIssues, toGithubIssue, type GithubIssue, type ListedIssue, type RawIssue } from "../services/github-app";
import { normalizeStatus } from "../shared/status";
import { notifyPostStatusChange } from "../status/notify";

/** A voter email for a status change; callers send these after responding. */
export type StatusNotification = Parameters<typeof notifyPostStatusChange>[0];
export type Notify = (notification: StatusNotification) => void;
import {
  DEFAULT_GITHUB_STATUS_SETTINGS,
  extractRequestRefs,
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
    autoStatus: row?.autoStatus ?? true,
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

/** Workspaces connected through `installationId` whose connecting user can access `repo`. */
async function connectedWorkspaces(db: Db, installationId: string, repo: string): Promise<ConnectedWorkspace[]> {
  const rows: Array<{ id: string; slug: string; customDomain: string | null; repos: string[] | null }> = await db
    .select({ id: workspace.id, slug: workspace.slug, customDomain: workspace.customDomain, repos: helpCenter.githubRepos })
    .from(helpCenter)
    .innerJoin(workspace, eq(helpCenter.workspaceId, workspace.id))
    .where(eq(helpCenter.githubInstallationId, installationId));
  return Promise.all(
    rows
      .filter((row) => row.repos?.includes(repo))
      .map(async (row) => ({
        id: row.id,
        slug: row.slug,
        customDomain: row.customDomain,
        settings: await getSyncSettings(db, row.id),
      })),
  );
}

/** Posts in `ws` that the issue description links to; slugs shared by several boards are skipped. */
async function referencedPostIds(db: Db, ws: ConnectedWorkspace, body: string | null | undefined) {
  const slugs = [...new Set(extractRequestRefs(body).filter((ref) => refBelongsTo(ref, ws)).map((ref) => ref.postSlug))];
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
  sender?: { login?: string };
  issue?: RawIssue & { body?: string | null; user?: { login?: string }; author_association?: string };
};

const TRUSTED_AUTHORS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

/**
 * Whether an issue's description may add or remove links. Anyone can open issues on a public
 * repo, so only repo members' own issues count, or edits to someone else's issue (which GitHub
 * only allows people with triage or write access to make).
 */
function canChangeLinks(issue: { user?: { login?: string }; author_association?: string }, senderLogin?: string) {
  const author = issue.user?.login;
  if (author && senderLogin && author !== senderLogin) return true;
  return TRUSTED_AUTHORS.has(String(issue.author_association ?? "").toUpperCase());
}

/**
 * Brings one workspace in line with one issue: when `trusted`, its description decides which
 * requests are linked (pasting a link links it, removing it unlinks); then every linked request
 * gets the issue's latest title/state and follows its status.
 */
async function processIssue(
  db: Db,
  ws: ConnectedWorkspace,
  repo: string,
  raw: RawIssue & { body?: string | null },
  trusted: boolean,
  notify: Notify,
) {
  const issue = toGithubIssue(raw);
  const forIssue = and(
    eq(githubIssueLink.workspaceId, ws.id),
    eq(githubIssueLink.repoFullName, repo),
    eq(githubIssueLink.issueNumber, issue.number),
  );
  const existing: Array<{ postId: string }> = await db
    .select({ postId: githubIssueLink.postId })
    .from(githubIssueLink)
    .where(forIssue);
  const alreadyLinked = new Set(existing.map((row) => row.postId));

  let postIds = [...alreadyLinked];
  if (trusted) {
    postIds = await referencedPostIds(db, ws, raw.body);
    // The description is the source of truth: drop links it no longer mentions.
    if (alreadyLinked.size > 0) {
      await db
        .delete(githubIssueLink)
        .where(postIds.length ? and(forIssue, notInArray(githubIssueLink.postId, postIds)) : forIssue);
    }
  }

  const snapshot = {
    title: issue.title,
    url: issue.url,
    state: issue.state,
    stateReason: issue.stateReason,
    labels: issue.labels,
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

/**
 * Applies a GitHub `issues` webhook to every workspace connected through the sending
 * installation that can access the repo. Voter emails go to `notify` so the caller can
 * answer GitHub first.
 */
export async function handleIssuesEvent(db: Db, event: IssuesEvent, notify: Notify) {
  const repo = String(event.repository?.full_name ?? "").toLowerCase();
  const installationId = String(event.installation?.id ?? "");
  const number = Number(event.issue?.number);
  const action = String(event.action);
  const result = { linked: 0, updated: 0 };
  if (!repo || !installationId || !Number.isSafeInteger(number) || !event.issue) return result;
  if (action !== "deleted" && action !== "transferred" && !ISSUE_ACTIONS.has(action)) return result;

  const workspaces = await connectedWorkspaces(db, installationId, repo);
  for (const ws of workspaces) {
    if (action === "deleted" || action === "transferred") {
      await db
        .delete(githubIssueLink)
        .where(
          and(
            eq(githubIssueLink.workspaceId, ws.id),
            eq(githubIssueLink.repoFullName, repo),
            eq(githubIssueLink.issueNumber, number),
          ),
        );
      continue;
    }
    const counts = await processIssue(db, ws, repo, event.issue, canChangeLinks(event.issue, event.sender?.login), notify);
    result.linked += counts.linked;
    result.updated += counts.updated;
  }
  return result;
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
};

/**
 * Re-reads issues from GitHub for one workspace: catches webhooks GitHub never delivered and
 * links issues that mentioned requests before GitHub was connected. Repos with links go first.
 */
export async function syncWorkspaceIssues(db: Db, workspaceId: string, notify: Notify): Promise<SyncSummary> {
  const connection = await getHelpGithubConnection(db, workspaceId);
  const summary: SyncSummary = { repos: 0, issues: 0, linked: 0, updated: 0, unlinked: 0, truncated: [] };
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
    const listed = await listRepoIssues(connection.installationId, repo, budget);
    budget -= listed.pages;
    summary.repos += 1;
    summary.issues += listed.issues.length;
    if (!listed.complete) summary.truncated.push(repo);

    const linkedRows: Array<{ issueNumber: number }> = await db
      .selectDistinct({ issueNumber: githubIssueLink.issueNumber })
      .from(githubIssueLink)
      .where(and(eq(githubIssueLink.workspaceId, workspaceId), eq(githubIssueLink.repoFullName, repo)));
    const linkedNumbers = new Set(linkedRows.map((row) => row.issueNumber));

    for (const issue of listed.issues as ListedIssue[]) {
      const trusted = canChangeLinks(issue);
      // Most issues neither are linked nor mention a request: skip them without touching the database.
      const mentions = trusted && extractRequestRefs(issue.body).some((ref) => refBelongsTo(ref, target));
      if (!linkedNumbers.has(issue.number) && !mentions) continue;
      const counts = await processIssue(db, target, repo, issue, trusted, notify);
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

import { eq } from "drizzle-orm";
import { helpCenter } from "@featul/db";

type Db = any;

export type HelpGithubConnection = {
  installationId: string;
  accountLogin: string | null;
  connectedAt: Date | null;
  /** Repos the connecting user could access; null for connections saved before this was tracked. */
  repos: string[] | null;
};

export async function getHelpGithubConnection(db: Db, workspaceId: string): Promise<HelpGithubConnection | null> {
  const [row] = await db
    .select({
      installationId: helpCenter.githubInstallationId,
      accountLogin: helpCenter.githubAccountLogin,
      connectedAt: helpCenter.githubConnectedAt,
      repos: helpCenter.githubRepos,
    })
    .from(helpCenter)
    .where(eq(helpCenter.workspaceId, workspaceId))
    .limit(1);
  // Connections saved before the repo allow-list existed can't scan anything; treat them as unconnected so the UI asks to reconnect.
  return row?.installationId && row.repos ? (row as HelpGithubConnection) : null;
}

/** The installation to scan `fullName` (lowercase `owner/name`) with, if the connecting user can access it. */
export async function getHelpGithubInstallationFor(db: Db, workspaceId: string, fullName: string) {
  const connection = await getHelpGithubConnection(db, workspaceId);
  if (!connection?.repos?.includes(fullName.toLowerCase())) return null;
  return connection.installationId;
}

export async function saveHelpGithubConnection(
  db: Db,
  input: { workspaceId: string; installationId: string; accountLogin: string; userId: string; repos: string[] },
) {
  const values = {
    githubRepos: input.repos,
    githubInstallationId: input.installationId,
    githubAccountLogin: input.accountLogin,
    githubConnectedById: input.userId,
    githubConnectedAt: new Date(),
  };
  await db
    .insert(helpCenter)
    .values({ workspaceId: input.workspaceId, ...values })
    .onConflictDoUpdate({ target: helpCenter.workspaceId, set: { ...values, updatedAt: new Date() } });
}

export async function clearHelpGithubConnection(db: Db, workspaceId: string) {
  await db
    .update(helpCenter)
    .set({
      githubInstallationId: null,
      githubAccountLogin: null,
      githubConnectedById: null,
      githubConnectedAt: null,
      githubRepos: null,
      updatedAt: new Date(),
    })
    .where(eq(helpCenter.workspaceId, workspaceId));
}

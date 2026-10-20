import { eq } from "drizzle-orm";
import { helpCenter } from "@featul/db";

type Db = any;

export type HelpGithubConnection = {
  installationId: string;
  accountLogin: string | null;
  connectedAt: Date | null;
};

export async function getHelpGithubConnection(db: Db, workspaceId: string): Promise<HelpGithubConnection | null> {
  const [row] = await db
    .select({
      installationId: helpCenter.githubInstallationId,
      accountLogin: helpCenter.githubAccountLogin,
      connectedAt: helpCenter.githubConnectedAt,
    })
    .from(helpCenter)
    .where(eq(helpCenter.workspaceId, workspaceId))
    .limit(1);
  return row?.installationId ? (row as HelpGithubConnection) : null;
}

export async function getHelpGithubInstallationId(db: Db, workspaceId: string) {
  return (await getHelpGithubConnection(db, workspaceId))?.installationId ?? null;
}

export async function saveHelpGithubConnection(
  db: Db,
  input: { workspaceId: string; installationId: string; accountLogin: string; userId: string },
) {
  const values = {
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
    .set({ githubInstallationId: null, githubAccountLogin: null, githubConnectedById: null, githubConnectedAt: null, updatedAt: new Date() })
    .where(eq(helpCenter.workspaceId, workspaceId));
}

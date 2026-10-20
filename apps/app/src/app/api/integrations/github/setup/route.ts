import { NextResponse } from "next/server";
import { db } from "@featul/db";
import { getServerSession } from "@featul/auth/session";
import { requireBoardManagerBySlug } from "@featul/api/shared/access";
import { saveHelpGithubConnection } from "@featul/api/help/import/github";
import {
  getInstallation,
  verifyInstallerAccess,
  verifySetupState,
} from "@featul/api/services/github-app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GitHub App setup URL. GitHub sends the user back here after they install the app.
 * Saves the installation only when the signed state matches the signed-in manager and the
 * user-authorization code proves they can access that installation.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const back = (path: string, status: string) => {
    const target = new URL(path, url.origin);
    target.searchParams.set("github", status);
    return NextResponse.redirect(target, 302);
  };

  let state;
  try {
    state = verifySetupState(String(url.searchParams.get("state") ?? ""));
  } catch {
    return back("/workspaces", "invalid_state");
  }

  const installationId = String(url.searchParams.get("installation_id") ?? "").trim();
  const code = String(url.searchParams.get("code") ?? "").trim();
  if (!/^\d+$/.test(installationId)) return back(state.returnTo, "missing_installation");
  if (!code) return back(state.returnTo, "authorization_required");

  const session = await getServerSession();
  if (!session?.user?.id || session.user.id !== state.userId) return back(state.returnTo, "wrong_user");

  try {
    const workspace = await requireBoardManagerBySlug({ db, session }, state.workspaceSlug);
    await verifyInstallerAccess(code, installationId);
    const installation = await getInstallation(installationId);
    await saveHelpGithubConnection(db, {
      workspaceId: workspace.id,
      installationId,
      accountLogin: installation.accountLogin,
      userId: session.user.id,
    });
    return back(state.returnTo, "connected");
  } catch (error) {
    console.error("[github-setup] failed", error);
    return back(state.returnTo, "failed");
  }
}

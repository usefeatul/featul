import { config as loadEnv } from "dotenv";
import path from "node:path";

const appEnvPath = path.resolve(process.cwd(), "../../apps/app/.env");
const dbEnvPath = path.resolve(process.cwd(), ".env");

loadEnv({ path: dbEnvPath });
loadEnv({ path: appEnvPath, override: true });

const useProduction = process.argv.includes("--production");

if (useProduction) {
  loadEnv({ path: dbEnvPath, override: true });
  const productionUrl = process.env.DATABASE_URL;
  if (!productionUrl?.includes("orange-darkness")) {
    throw new Error(
      "Production DATABASE_URL not found. Expected ep-orange-darkness in packages/db/.env",
    );
  }
}

const databaseHost = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? "").hostname;
  } catch {
    return "unknown";
  }
})();

const cliArgs = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith("-") && arg !== "--production");
const identifier = cliArgs[0];

const dryRun = process.argv.includes("--dry-run");
const confirm = process.argv.includes("--confirm");

if (!identifier) {
  console.error(`
Usage: bun run db:delete-user -- <email|userId> [--dry-run | --confirm] [--production]

  --dry-run      Show what would be deleted without making changes
  --confirm      Permanently delete the user and all related data
  --production   Use production DATABASE_URL from packages/db/.env

Examples:
  bun run db:delete-user -- tryfeatul@gmail.com --dry-run
  bun run db:delete-user -- tryfeatul@gmail.com --confirm
  bun run db:delete-user -- fxgXnRpltIjH2P671mNalQmpoM1W1u42 --confirm
`);
  process.exit(1);
}

if (!dryRun && !confirm) {
  console.error("Pass --dry-run to preview or --confirm to delete.");
  process.exit(1);
}

async function main() {
  const { count, eq } = await import("drizzle-orm");
  const {
    db,
    user,
    session,
    board,
    workspace,
    post,
    comment,
    postUpdate,
    changelogEntry,
    workspaceInvite,
    workspaceMember,
    workspaceSlugReservation,
    postReport,
    commentReport,
  } = await import("../index");

  let userId: string;

  if (identifier.includes("@")) {
    const [found] = await db
      .select({ id: user.id, email: user.email, name: user.name })
      .from(user)
      .where(eq(user.email, identifier))
      .limit(1);

    if (!found) {
      throw new Error(`User not found with email: ${identifier}`);
    }

    userId = found.id;
  } else {
    const [found] = await db
      .select({ id: user.id, email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, identifier))
      .limit(1);

    if (!found) {
      throw new Error(`User not found with id: ${identifier}`);
    }

    userId = found.id;
  }

  async function countRows(table: any, column: any) {
    const [row] = await db.select({ value: count() }).from(table).where(eq(column, userId));
    return Number(row?.value ?? 0);
  }

  const [found] = await db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!found) {
    throw new Error(`User not found: ${userId}`);
  }

  const summary = {
    user: found,
    sessions: await countRows(session, session.userId),
    ownedWorkspaces: await countRows(workspace, workspace.ownerId),
    boardsCreated: await countRows(board, board.createdBy),
    postsAuthored: await countRows(post, post.authorId),
    commentsAuthored: await countRows(comment, comment.authorId),
    postUpdatesAuthored: await countRows(postUpdate, postUpdate.authorId),
    changelogEntriesAuthored: await countRows(changelogEntry, changelogEntry.authorId),
    workspaceInvitesSent: await countRows(workspaceInvite, workspaceInvite.invitedBy),
    workspaceMemberships: await countRows(workspaceMember, workspaceMember.userId),
    postsModerated: await countRows(post, post.moderatedBy),
    commentsModerated: await countRows(comment, comment.moderatedBy),
    postReportsReviewed: await countRows(postReport, postReport.reviewedBy),
    commentReportsReviewed: await countRows(commentReport, commentReport.reviewedBy),
    slugReservationsClaimed: await countRows(
      workspaceSlugReservation,
      workspaceSlugReservation.claimedByUserId,
    ),
  };

  console.log(`Database: ${databaseHost}${useProduction ? " (production)" : " (dev)"}`);
  console.log(`User: ${summary.user.name} <${summary.user.email}> (${summary.user.id})`);
  console.log("");
  console.log("Related records:");
  console.log(`  Sessions:                 ${summary.sessions}`);
  console.log(`  Owned workspaces:         ${summary.ownedWorkspaces}`);
  console.log(`  Boards created:           ${summary.boardsCreated}`);
  console.log(`  Posts authored:           ${summary.postsAuthored}`);
  console.log(`  Comments authored:        ${summary.commentsAuthored}`);
  console.log(`  Post updates authored:    ${summary.postUpdatesAuthored}`);
  console.log(`  Changelog entries:        ${summary.changelogEntriesAuthored}`);
  console.log(`  Workspace invites sent:   ${summary.workspaceInvitesSent}`);
  console.log(`  Workspace memberships:    ${summary.workspaceMemberships}`);
  console.log(`  Posts moderated:          ${summary.postsModerated}`);
  console.log(`  Comments moderated:       ${summary.commentsModerated}`);
  console.log(`  Post reports reviewed:    ${summary.postReportsReviewed}`);
  console.log(`  Comment reports reviewed: ${summary.commentReportsReviewed}`);
  console.log(`  Slug reservations:        ${summary.slugReservationsClaimed}`);

  if (dryRun) {
    console.log("");
    console.log("Dry run only. No data was deleted.");
    return;
  }

  await db.delete(session).where(eq(session.userId, userId));
  await db.delete(post).where(eq(post.authorId, userId));
  await db.delete(comment).where(eq(comment.authorId, userId));
  await db.delete(postUpdate).where(eq(postUpdate.authorId, userId));
  await db.delete(changelogEntry).where(eq(changelogEntry.authorId, userId));
  await db.update(post).set({ moderatedBy: null }).where(eq(post.moderatedBy, userId));
  await db.update(comment).set({ moderatedBy: null }).where(eq(comment.moderatedBy, userId));
  await db.update(postReport).set({ reviewedBy: null }).where(eq(postReport.reviewedBy, userId));
  await db
    .update(commentReport)
    .set({ reviewedBy: null })
    .where(eq(commentReport.reviewedBy, userId));
  await db
    .update(workspaceMember)
    .set({ invitedBy: null })
    .where(eq(workspaceMember.invitedBy, userId));
  await db
    .update(workspaceSlugReservation)
    .set({ claimedByUserId: null })
    .where(eq(workspaceSlugReservation.claimedByUserId, userId));
  await db.delete(workspaceInvite).where(eq(workspaceInvite.invitedBy, userId));
  await db.delete(board).where(eq(board.createdBy, userId));
  await db.delete(workspace).where(eq(workspace.ownerId, userId));
  await db.delete(user).where(eq(user.id, userId));

  console.log("");
  console.log(`Deleted user ${summary.user.email} (${userId}) and all related content.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

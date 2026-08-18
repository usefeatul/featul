import { config as loadEnv } from "dotenv";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";

const appEnvPath = path.resolve(process.cwd(), "../../apps/app/.env");
const dbEnvPath = path.resolve(process.cwd(), ".env");

loadEnv({ path: dbEnvPath });
loadEnv({ path: appEnvPath, override: true });

const databaseHost = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? "").hostname;
  } catch {
    return "unknown";
  }
})();

if (databaseHost.includes("orange-darkness")) {
  throw new Error("Refusing to set a local test plan on the production database.");
}

const userId = (process.env.DEV_PLAN_USER_ID || "").trim();
const userEmail = (process.env.DEV_PLAN_USER_EMAIL || "").trim().toLowerCase();
const requestedPlan = (process.env.DEV_PLAN || "professional").trim().toLowerCase();
const workspaceIdFilter = (process.env.DEV_PLAN_WORKSPACE_ID || "").trim();

if (!userId || !userEmail) {
  console.error(`
Usage: set DEV_PLAN_USER_ID and DEV_PLAN_USER_EMAIL in apps/app/.env, then run:

  bun run db:set-dev-plan

Optional:
  DEV_PLAN=starter|professional   (default: professional)
  DEV_PLAN_WORKSPACE_ID=<id>      (default: all owned workspaces)
  DEV_PLAN_OVERRIDE=true          required in apps/app/.env so paid checks trust the local sub
`);
  process.exit(1);
}

if (requestedPlan !== "starter" && requestedPlan !== "professional") {
  throw new Error(`DEV_PLAN must be starter or professional, got: ${requestedPlan}`);
}

async function main() {
  const { and, eq } = await import("drizzle-orm");
  const { db, user, workspace, workspaceMember, subscription } = await import("../index.js");

  const [found] = await db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(and(eq(user.id, userId), eq(user.email, userEmail)))
    .limit(1);

  if (!found) {
    throw new Error(
      `User not found with id ${userId} and email ${userEmail}. Both env values must match the same user.`,
    );
  }

  const ownedWorkspaces = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      plan: workspace.plan,
    })
    .from(workspace)
    .where(eq(workspace.ownerId, found.id));

  let workspaces = ownedWorkspaces;
  if (workspaceIdFilter) {
    workspaces = ownedWorkspaces.filter((ws) => ws.id === workspaceIdFilter);
  }

  if (workspaces.length === 0) {
    const memberships = await db
      .select({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
      })
      .from(workspaceMember)
      .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
      .where(eq(workspaceMember.userId, found.id));

    workspaces = workspaceIdFilter
      ? memberships.filter((ws) => ws.id === workspaceIdFilter)
      : memberships;
  }

  if (workspaces.length === 0) {
    throw new Error(`No workspaces found for ${found.email}${workspaceIdFilter ? ` (filter: ${workspaceIdFilter})` : ""}`);
  }

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  console.log(`Database: ${databaseHost} (dev)`);
  console.log(`User: ${found.name} <${found.email}> (${found.id})`);
  console.log(`Plan: ${requestedPlan}`);
  console.log("");

  for (const ws of workspaces) {
    const fakeSubscriptionId = `dev_sub_${ws.id}`;
    const fakeCustomerId = `dev_cus_${found.id}`;

    const [existing] = await db
      .select({ id: subscription.id, stripeSubscriptionId: subscription.stripeSubscriptionId })
      .from(subscription)
      .where(eq(subscription.referenceId, ws.id))
      .limit(1);

    if (existing) {
      await db
        .update(subscription)
        .set({
          plan: requestedPlan,
          status: "active",
          stripeCustomerId: fakeCustomerId,
          stripeSubscriptionId: fakeSubscriptionId,
          billingInterval: "year",
          periodStart,
          periodEnd,
          cancelAtPeriodEnd: false,
          cancelAt: null,
          canceledAt: null,
          endedAt: null,
          trialStart: null,
          trialEnd: null,
          updatedAt: new Date(),
        })
        .where(eq(subscription.id, existing.id));
    } else {
      await db.insert(subscription).values({
        id: createId(),
        referenceId: ws.id,
        plan: requestedPlan,
        status: "active",
        stripeCustomerId: fakeCustomerId,
        stripeSubscriptionId: fakeSubscriptionId,
        billingInterval: "year",
        periodStart,
        periodEnd,
        cancelAtPeriodEnd: false,
        seats: 1,
      });
    }

    await db.update(workspace).set({ plan: requestedPlan }).where(eq(workspace.id, ws.id));

    console.log(`  ${ws.slug} (${ws.id}): ${ws.plan} -> ${requestedPlan}`);
  }

  if (process.env.DEV_PLAN_OVERRIDE !== "true") {
    console.log("");
    console.log("Set DEV_PLAN_OVERRIDE=true in apps/app/.env and restart the app so paid feature checks trust this local subscription.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

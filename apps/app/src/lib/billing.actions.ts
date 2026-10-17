"use server";

import { z } from "zod";
import { getServerSession } from "@featul/auth/session";
import { getSettingsInitialData, listUserWorkspaces } from "@/lib/workspace";
import { normalizePlan } from "@/lib/plan";

export async function getPricingDetails(input: string) {
  const slug = z.string().min(1).parse(input);
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Sign in to view plans");
  const workspaces = await listUserWorkspaces(session.user.id);
  if (!workspaces.some((workspace) => workspace.slug === slug)) {
    throw new Error("Workspace access denied");
  }

  const data = await getSettingsInitialData(slug, session.user.id, "billing");
  if (!data.initialWorkspaceId) throw new Error("Workspace not found");

  return {
    currentPlan: normalizePlan(data.initialPlan || "free"),
    currentBillingCycle:
      data.initialBillingSubscription?.billingInterval === "year"
        ? ("yearly" as const)
        : ("monthly" as const),
    workspaceId: data.initialWorkspaceId,
    workspaceSlug: slug,
    canManageBilling: data.initialWorkspaceOwnerId === session.user.id,
    trialEligible: data.initialTrialEligible ?? false,
    currentSubscriptionId:
      data.initialBillingSubscription?.stripeSubscriptionId || undefined,
  };
}

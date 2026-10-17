"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import { authClient, useSession } from "@featul/auth/client";
import { toast } from "sonner";
import { LoadingButton } from "@/components/global/LoadingButton";
import { normalizePlan } from "@/lib/plan";
import Plans from "./plans";
import Usage from "./usage";
import { BillingIcon } from "@/components/global/icons";
import type { BillingUsage } from "@/types/billing";
import { type BillingCycle, getPlan } from "./data";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";

type BillingSubscription = {
  id: string;
  plan: string;
  status: string;
  stripeSubscriptionId?: string | null;
  billingInterval?: string | null;
  periodEnd?: string | Date | null;
  cancelAtPeriodEnd?: boolean | null;
  trialEnd?: string | Date | null;
};

type BillingSectionProps = {
  slug: string;
  currentPlan?: string;
  workspaceId?: string;
  workspaceOwnerId?: string;
  initialSubscription?: BillingSubscription | null;
  usage?: BillingUsage;
  trialEligible?: boolean;
};

export default function BillingSection({
  slug,
  currentPlan,
  workspaceId,
  workspaceOwnerId,
  initialSubscription = null,
  trialEligible = false,
  usage,
}: BillingSectionProps) {
  const normalizedPlan = normalizePlan(String(currentPlan || "free"));
  const activePlan = getPlan(normalizedPlan);
  const initialBillingCycle: BillingCycle =
    initialSubscription?.billingInterval === "year" ? "yearly" : "monthly";
  const subscription = initialSubscription;
  const [isOpeningPortal, setIsOpeningPortal] = React.useState(false);
  const { data: session } = useSession();

  const isOwner = Boolean(
    workspaceOwnerId &&
    session?.user?.id &&
    workspaceOwnerId === session.user.id,
  );

  const handleOpenPortal = async () => {
    if (!workspaceId || !isOwner || isOpeningPortal) return;

    try {
      setIsOpeningPortal(true);
      const returnUrl = `${window.location.origin}/api/billing/success?workspaceId=${encodeURIComponent(workspaceId)}`;
      const { data, error } = await authClient.subscription.billingPortal({
        referenceId: workspaceId,
        returnUrl,
        disableRedirect: true,
      });

      if (error) {
        toast.error(error.message || "Failed to open billing portal");
        return;
      }

      if (!data?.url) {
        toast.error("Billing portal URL missing");
        return;
      }

      captureAnalyticsEvent(analyticsEvents.billingPortalOpened, {
        workspace_id: workspaceId,
        workspace_slug: slug,
      });
      window.location.href = data.url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to open billing portal";
      toast.error(message);
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const billingAction = subscription ? (
    <LoadingButton
      variant="nav"
      loading={isOpeningPortal}
      disabled={!isOwner || isOpeningPortal}
      onClick={handleOpenPortal}
      className="min-w-36"
    >
      Manage billing
    </LoadingButton>
  ) : null;
  const currentBillingCycle: BillingCycle =
    subscription?.billingInterval === "year"
      ? "yearly"
      : subscription?.billingInterval === "month"
        ? "monthly"
        : initialBillingCycle;
  const currentAmount =
    currentBillingCycle === "yearly"
      ? activePlan.yearlyPrice
      : activePlan.monthlyPrice;
  const currentSuffix = currentBillingCycle === "yearly" ? "/year" : "/mo";
  const trialEndLabel = React.useMemo(() => {
    if (!subscription?.trialEnd || subscription.status !== "trialing")
      return null;

    const trialEndDate = new Date(subscription.trialEnd);
    if (Number.isNaN(trialEndDate.getTime())) return null;

    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(trialEndDate);
  }, [subscription?.status, subscription?.trialEnd]);

  return (
    <div className="space-y-8">
      <SectionCard title="Your subscription" contentClassName="py-0">
        <div className="flex flex-wrap items-center justify-between gap-5 py-6">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BillingIcon className="size-6" />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                {activePlan.label} plan
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {trialEndLabel
                  ? `Trial until ${trialEndLabel}`
                  : activePlan.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">
              £{currentAmount}
            </span>
            <span className="text-sm text-muted-foreground">
              {normalizedPlan === "free" ? "forever" : currentSuffix}
            </span>
          </div>
        </div>
        <div className="-mx-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 px-5 py-4">
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            {normalizedPlan === "free"
              ? "More room for your team, whenever you need it."
              : `Billed ${currentBillingCycle === "yearly" ? "annually" : "monthly"}. Review your plan or manage payment details.`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {billingAction}
            <Plans
              currentPlan={normalizedPlan}
              currentBillingCycle={currentBillingCycle}
              workspaceId={workspaceId}
              workspaceSlug={slug}
              canManageBilling={isOwner}
              trialEligible={trialEligible}
              currentSubscriptionId={
                subscription?.stripeSubscriptionId || undefined
              }
            />
          </div>
        </div>
        {subscription?.status === "past_due" ||
        subscription?.status === "unpaid" ? (
          <p
            role="alert"
            className="border-t border-border/50 -mx-5 px-5 py-4 text-sm text-destructive"
          >
            Your payment failed. Open Manage billing to update your payment
            method and pay the outstanding invoice.
          </p>
        ) : null}
        {subscription?.cancelAtPeriodEnd && subscription.periodEnd ? (
          <p className="border-t border-border/50 -mx-5 px-5 py-4 text-sm text-muted-foreground">
            Your subscription ends on{" "}
            {new Date(subscription.periodEnd).toLocaleDateString()}. You can
            restore it in Manage billing before then.
          </p>
        ) : null}
      </SectionCard>
      {usage ? <Usage plan={normalizedPlan} usage={usage} /> : null}
    </div>
  );
}

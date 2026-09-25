"use client";

import React from "react";
import { type PlanKey } from "@/lib/plan";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { DitherGradient } from "@featul/ui/components/gradient";
import type { PixelColor } from "@featul/ui/lib/pixel";
import { cn } from "@featul/ui/lib/utils";
import PlanFlagRibbon from "./PlanFlagRibbon";
import PlanCheckoutButton from "./PlanCheckoutButton";
import { type BillingCycle, getPlan, getPlanHighlights } from "./data";

const wash: Record<PlanKey, PixelColor> = {
  free: [110, 114, 122],
  starter: "blue",
  professional: "orange",
};

type PlanOptionCardProps = {
  planKey: PlanKey;
  currentPlan: PlanKey;
  billingCycle: BillingCycle;
  workspaceId?: string;
  workspaceSlug: string;
  canManageBilling: boolean;
  currentSubscriptionId?: string;
};

export default function PlanOptionCard({
  planKey,
  currentPlan,
  billingCycle,
  workspaceId,
  workspaceSlug,
  canManageBilling,
  currentSubscriptionId,
}: PlanOptionCardProps) {
  const plan = getPlan(planKey);
  const isCurrent = currentPlan === planKey;
  const amount =
    billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const valueClass =
    planKey === "professional"
      ? "text-orange-600 dark:text-orange-400"
      : planKey === "starter"
        ? "text-blue-600 dark:text-blue-400"
        : "text-foreground";

  return (
    <div
      className={cn(
        overlayDialogClass,
        "relative flex h-full min-w-0 flex-col",
      )}
    >
      <div
        className={cn(
          overlayInnerClass,
          "relative flex flex-1 flex-col overflow-hidden px-5 py-5",
        )}
      >
        {planKey === "professional" ? (
          <PlanFlagRibbon label="Most popular" tone="value" className="z-20" />
        ) : null}
        <div className="relative -mx-5 -mt-5 overflow-hidden px-5 pb-5 pt-5">
          <DitherGradient
            from={wash[planKey]}
            to="transparent"
            direction="down"
            cell={3}
            bloom="low"
            opacity={0.9}
            className="dark:opacity-40 [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]"
          />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading text-2xl font-light leading-none text-foreground">
                {plan.label}
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/65">
                {billingCycle === "yearly" ? "Yearly" : "Monthly"}
              </span>
            </div>
            <div className="mt-4 flex items-baseline text-4xl font-light tracking-tight text-foreground">
              <span className="tabular-nums">${amount}</span>
              <span className="ml-1 text-sm font-normal text-foreground/80">
                /{billingCycle === "yearly" ? "year" : "mo"}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {isCurrent ? "Your current plan" : plan.tagline}
            </p>
          </div>
        </div>
        <dl className="relative z-10 -mx-5 space-y-2.5 border-t border-border/60 bg-background px-5 pt-4 text-xs">
          {getPlanHighlights(planKey).map((item) => (
            <div
              key={item.label}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className={cn("shrink-0 tabular-nums", valueClass)}>
                {item.value}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground">Charged</dt>
            <dd className={cn("shrink-0 tabular-nums", valueClass)}>
              {planKey === "free"
                ? "Free"
                : `$${amount} / ${billingCycle === "yearly" ? "yr" : "mo"}`}
            </dd>
          </div>
        </dl>
        <ul className="relative z-10 -mx-5 mt-4 flex-1 space-y-2 border-t border-border/60 bg-background px-5 pt-4 text-xs text-foreground">
          {plan.features.map((feature) => (
            <li
              key={feature.title}
              className="flex items-start gap-2 leading-relaxed"
            >
              <span aria-hidden className="select-none text-muted-foreground">
                +
              </span>
              <span>{feature.title}</span>
            </li>
          ))}
        </ul>
        <div className="relative z-10 mt-5 bg-background">
          <PlanCheckoutButton
            plan={plan}
            billingCycle={billingCycle}
            isCurrent={isCurrent}
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            canManageBilling={canManageBilling}
            currentSubscriptionId={currentSubscriptionId}
            className={cn(
              "h-9 w-full text-sm",
              !isCurrent &&
                planKey === "starter" &&
                "border-blue-500/45 bg-blue-500 text-white hover:bg-blue-500/90 dark:hover:bg-blue-500/90",
              !isCurrent &&
                planKey === "professional" &&
                "border-orange-500/45 bg-orange-500 text-white hover:bg-orange-500/90 dark:hover:bg-orange-500/90",
            )}
          />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {isCurrent
              ? "Manage your subscription above."
              : plan.trialDays
                ? `${plan.trialDays}-day free trial. Cancel anytime.`
                : "No credit card required."}
          </p>
        </div>
      </div>
    </div>
  );
}

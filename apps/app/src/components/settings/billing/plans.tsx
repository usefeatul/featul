"use client";

import { useState } from "react";
import { Button } from "@featul/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@featul/ui/components/dialog";
import { BoardIcon } from "@/components/global/icons";
import type { PlanKey } from "@/lib/plan";
import { cn } from "@featul/ui/lib/utils";
import BillingCycleSegment from "./BillingCycleSegment";
import PlanCheckoutButton from "./PlanCheckoutButton";
import Comparison from "./comparison";
import Counter from "./counter";
import styles from "./plans.module.css";
import { getPlan, type BillingCycle } from "./data";

type Props = {
  currentPlan: PlanKey;
  currentBillingCycle: BillingCycle;
  workspaceId?: string;
  workspaceSlug: string;
  canManageBilling: boolean;
  trialEligible: boolean;
  currentSubscriptionId?: string;
};

export default function Plans(props: Props) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    props.currentBillingCycle,
  );
  const [selected, setSelected] = useState<PlanKey>(props.currentPlan);
  const plan = getPlan(selected);
  const amount =
    billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const period =
    selected === "free"
      ? "forever"
      : billingCycle === "yearly"
        ? "/ year"
        : "/ month";
  const isCurrent =
    selected === props.currentPlan &&
    (selected === "free" || billingCycle === props.currentBillingCycle);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View plans</Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-[45rem] flex-col gap-0 overflow-hidden p-0 sm:max-w-[45rem]">
        <DialogHeader className="shrink-0 px-6 pb-4 pt-5 text-left">
          <DialogTitle className="flex items-center gap-3 pr-6 text-base font-medium">
            <BoardIcon className="size-4" />
            Plans for your workspace
          </DialogTitle>
          <DialogDescription className="sm:pl-11">
            The right amount of room for your team.
          </DialogDescription>
        </DialogHeader>
        <div
          className={cn(
            "min-h-0 overflow-y-auto overscroll-contain",
            styles.scroll,
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5 pt-1">
            <BillingCycleSegment
              billingCycle={billingCycle}
              onChange={setBillingCycle}
            />
            {billingCycle === "yearly" ? (
              <span className="text-xs text-muted-foreground">
                2 months free with yearly billing
              </span>
            ) : null}
          </div>
          <div className="mx-4 overflow-hidden rounded-xl border border-border/40 bg-background/30 sm:mx-6">
            <Comparison
              selected={selected}
              onSelect={setSelected}
              currentPlan={props.currentPlan}
              billingCycle={billingCycle}
            />
          </div>
          <p className="px-6 py-4 text-xs leading-relaxed text-muted-foreground">
            Every plan includes a feedback portal, roadmap, changelog, voting,
            and an in-app widget.
          </p>
        </div>
        <div className="shrink-0 border-t border-border/40 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                {plan.label}{" "}
                <span className="px-1 text-muted-foreground">·</span> £
                <Counter value={amount} />{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {period}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected === "free"
                  ? "No subscription required."
                  : billingCycle === "yearly"
                    ? `Billed annually with 2 months free. Save £${plan.monthlyPrice * 12 - plan.yearlyPrice} a year.`
                    : "Billed monthly. Cancel anytime."}
              </p>
            </div>
            <PlanCheckoutButton
              {...props}
              plan={plan}
              billingCycle={billingCycle}
              isCurrent={isCurrent}
              className="w-full sm:w-auto sm:min-w-36"
            />
          </div>
          {!props.canManageBilling ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Only the workspace owner can change the subscription.
            </p>
          ) : null}
          {selected === "free" && props.currentPlan !== "free" ? (
            <p className="mt-3 text-xs text-muted-foreground">
              To move to Free, cancel your subscription in Manage billing.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

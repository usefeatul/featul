"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@featul/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@featul/ui/components/dialog";
import type { PlanKey } from "@/lib/plan";
import { cn } from "@featul/ui/lib/utils";
import BillingCycleSegment from "./BillingCycleSegment";
import PlanCheckoutButton from "./PlanCheckoutButton";
import Comparison from "./comparison";
import { plansDialogSurfaceClass } from "./styles";
import { getPlan, type BillingCycle } from "./data";

type Props = {
  currentPlan: PlanKey;
  currentBillingCycle: BillingCycle;
  workspaceId?: string;
  workspaceSlug: string;
  canManageBilling: boolean;
  trialEligible: boolean;
  currentSubscriptionId?: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function Plans(props: Props) {
  const [selectedBillingCycle, setBillingCycle] = useState<BillingCycle | null>(null);
  const billingCycle = selectedBillingCycle ?? props.currentBillingCycle;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger asChild>
        {props.trigger ?? <Button>View plans</Button>}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "flex max-h-[82dvh] w-[calc(100%-2rem)] max-w-[56rem] flex-col gap-0 overflow-hidden bg-background p-0 sm:max-w-[56rem] dark:bg-background",
          plansDialogSurfaceClass,
        )}
      >
        <DialogHeader className="shrink-0 px-5 pb-5 pt-6 text-left sm:px-7 sm:pt-7">
          <DialogTitle className="pr-6 text-xl font-semibold tracking-tight">
            A little more room to grow
          </DialogTitle>
          <DialogDescription>
            Compare plans and find the right fit for your workspace.
          </DialogDescription>
        </DialogHeader>
        <div
          className="min-h-0 overflow-y-auto overscroll-contain"
        >
          <Comparison
            currentPlan={props.currentPlan}
            billingCycle={billingCycle}
            renderAction={(key) => (
              <PlanCheckoutButton
                {...props}
                plan={getPlan(key)}
                billingCycle={billingCycle}
                isCurrent={
                  key === props.currentPlan &&
                  (key === "free" || billingCycle === props.currentBillingCycle)
                }
                className="w-full text-xs"
              />
            )}
          />
          <p className="px-5 pb-5 text-xs leading-relaxed text-muted-foreground sm:px-7">
            Every plan includes a feedback portal, roadmap, changelog, voting,
            and an in-app widget.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3 border-t border-border/50 bg-muted/20 px-5 py-4 text-xs leading-relaxed text-muted-foreground sm:px-7">
          <div className="min-w-0 flex-1 basis-52">
            <p>
              {billingCycle === "monthly" ? "Switch to yearly for " : null}
              <strong className="font-semibold text-foreground">
                2 months free
              </strong>
              {billingCycle === "yearly" ? " with yearly billing" : null}
            </p>
            {!props.canManageBilling ? (
              <p className="mt-2">
                Only the workspace owner can change the subscription.
              </p>
            ) : null}
            {props.currentPlan !== "free" ? (
              <p className="mt-2">
                To move to Free, cancel your subscription in Manage billing.
              </p>
            ) : null}
          </div>
          <div className="ml-auto shrink-0">
            <BillingCycleSegment
              billingCycle={billingCycle}
              onChange={setBillingCycle}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

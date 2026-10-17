"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@featul/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@featul/ui/components/tooltip";
import { Sparkles } from "@/components/global/icons";
import Plans from "@/components/settings/billing/plans";
import { getPricingDetails } from "@/lib/billing.actions";
import type { PlanKey } from "@/lib/plan";

export default function Pricing({
  slug,
  collapsed,
  plan,
}: {
  slug: string;
  collapsed: boolean;
  plan: PlanKey;
}) {
  const [open, setOpen] = useState(false);
  const pending = useRef(false);
  const [details, setDetails] =
    useState<Awaited<ReturnType<typeof getPricingDetails>>>();

  const handleOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) return;
    if (pending.current) return;
    pending.current = true;
    try {
      setDetails(await getPricingDetails(slug));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load plans",
      );
    } finally {
      pending.current = false;
    }
  };

  const trigger = collapsed ? (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label="View upgrade plans"
      className="text-muted-foreground dark:bg-transparent dark:text-muted-foreground"
    >
      <Sparkles className="size-4" />
    </Button>
  ) : (
    <button
      type="button"
      className="mt-1 inline-flex min-h-6 cursor-pointer items-center rounded-lg text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      View plans
    </button>
  );

  const plans = (
    <Plans
      currentPlan={plan}
      currentBillingCycle="monthly"
      workspaceSlug={slug}
      canManageBilling={false}
      trialEligible={false}
      {...details}
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        collapsed ? <TooltipTrigger asChild>{trigger}</TooltipTrigger> : trigger
      }
    />
  );

  return collapsed ? (
    <Tooltip>
      {plans}
      <TooltipContent side="right" sideOffset={10}>
        View plans
      </TooltipContent>
    </Tooltip>
  ) : (
    plans
  );
}

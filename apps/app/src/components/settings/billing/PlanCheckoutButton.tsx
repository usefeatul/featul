"use client"

import React from "react"
import { authClient } from "@featul/auth/client"
import { toast } from "sonner"
import { cn } from "@featul/ui/lib/utils"
import { LoadingButton } from "@/components/global/loading-button"
import { type BillingCycle, type PlanOption } from "./billing-data"

type PlanCheckoutButtonProps = {
  plan: PlanOption
  billingCycle: BillingCycle
  isCurrent: boolean
  workspaceId?: string
  workspaceSlug: string
  canManageBilling: boolean
  currentSubscriptionId?: string
  className?: string
}

export default function PlanCheckoutButton({
  plan,
  billingCycle,
  isCurrent,
  workspaceId,
  workspaceSlug,
  canManageBilling,
  currentSubscriptionId,
  className,
}: PlanCheckoutButtonProps) {
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const isFreePlan = plan.id === "free"
  const isProfessional = plan.id === "professional"

  const handleCheckout = async () => {
    if (isCheckingOut) return
    if (!workspaceId) {
      toast.error("Workspace not found")
      return
    }
    if (!canManageBilling) {
      toast.error("Only the workspace owner can manage billing")
      return
    }
    if (isFreePlan) {
      toast.error("Free plan doesn't require checkout")
      return
    }

    try {
      setIsCheckingOut(true)
      const billingUrl = `${window.location.origin}/workspaces/${workspaceSlug}/settings/billing`
      const { error, data } = await authClient.subscription.upgrade({
        plan: plan.id,
        annual: billingCycle === "yearly",
        referenceId: workspaceId,
        subscriptionId: currentSubscriptionId,
        successUrl: billingUrl,
        cancelUrl: billingUrl,
        returnUrl: billingUrl,
        disableRedirect: true,
      })

      if (error) {
        toast.error(error.message || "Failed to start checkout")
        return
      }

      if (!data?.url) {
        toast.error("Checkout URL missing")
        return
      }

      window.location.href = data.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start checkout"
      toast.error(message)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isCurrent) {
    return (
      <LoadingButton variant="nav" disabled className={cn("opacity-50", className)}>
        Current
      </LoadingButton>
    )
  }

  if (isFreePlan) {
    return (
      <LoadingButton variant="nav" disabled className={cn("opacity-50", className)}>
        Free plan
      </LoadingButton>
    )
  }

  return (
    <LoadingButton
      className={cn(
        className,
        isProfessional && "bg-orange-400! text-white! hover:bg-orange-400! dark:bg-orange-400! dark:hover:bg-orange-400! border-orange-400!",
      )}
      loading={isCheckingOut}
      disabled={!canManageBilling || isCurrent || isCheckingOut}
      onClick={handleCheckout}
    >
      Choose plan
    </LoadingButton>
  )
}

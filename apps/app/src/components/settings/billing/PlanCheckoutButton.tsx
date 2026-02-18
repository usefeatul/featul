"use client"

import React from "react"
import { authClient } from "@featul/auth/client"
import { toast } from "sonner"
import { cn } from "@featul/ui/lib/utils"
import { LoadingButton } from "@/components/global/loading-button"
import { type BillingCycle, type PlanOption, getCheckoutSlug } from "./billing-data"

type PlanCheckoutButtonProps = {
  plan: PlanOption
  billingCycle: BillingCycle
  isCurrent: boolean
  workspaceId?: string
  className?: string
}

export default function PlanCheckoutButton({
  plan,
  billingCycle,
  isCurrent,
  workspaceId,
  className,
}: PlanCheckoutButtonProps) {
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const isFreePlan = plan.id === "free"

  const handleCheckout = async () => {
    if (isCheckingOut) return
    if (!workspaceId) {
      toast.error("Workspace not found")
      return
    }

    const slug = getCheckoutSlug(plan.id, billingCycle)
    if (!slug) {
      toast.error("Free plan doesn't require checkout")
      return
    }

    try {
      setIsCheckingOut(true)
      const { error, data } = await authClient.checkout({
        slug,
        referenceId: workspaceId,
        metadata: {
          plan: plan.id,
          billingCycle,
        },
        redirect: false,
      })

      if (error) {
        toast.error(error.message || "Failed to start checkout")
        return
      }

      const url =
        data && typeof data === "object" && "url" in data
          ? String((data as { url?: string }).url || "")
          : ""
      if (!url) {
        toast.error("Checkout URL missing")
        return
      }
      window.location.href = url
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
      className={cn(className)}
      loading={isCheckingOut}
      disabled={isCurrent || isCheckingOut}
      onClick={handleCheckout}
    >
      Choose plan
    </LoadingButton>
  )
}

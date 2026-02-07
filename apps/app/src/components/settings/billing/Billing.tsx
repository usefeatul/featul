"use client"

import React from "react"
import SectionCard from "../global/SectionCard"
import { SettingsDialogShell } from "../global/SettingsDialogShell"
import { Button } from "@featul/ui/components/button"
import { Switch } from "@featul/ui/components/switch"
import { cn } from "@featul/ui/lib/utils"
import { normalizePlan, type PlanKey } from "@/lib/plan"
import { CreditCard, Check } from "lucide-react"
import { authClient } from "@featul/auth/client"
import { toast } from "sonner"

type BillingCycle = "monthly" | "yearly"

type PlanFeature = {
  title: string
  description: string
}

type PlanOption = {
  id: PlanKey
  label: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
}

const BILLING_PLANS: Record<PlanKey, PlanOption> = {
  free: {
    id: "free",
    label: "Free",
    tagline: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { title: "Basic feedback boards", description: "Collect and track feedback in a simple board." },
      { title: "Up to 3 team members", description: "Invite a small team to collaborate." },
      { title: "Standard branding", description: "Show the Featul badge on your workspace." },
    ],
  },
  starter: {
    id: "starter",
    label: "Starter",
    tagline: "For teams ready to grow",
    monthlyPrice: 24,
    yearlyPrice: 240,
    features: [
      { title: "Everything in Free", description: "All core feedback features included." },
      { title: "Custom branding", description: "Upload your logo and colors." },
      { title: "Integrations", description: "Connect Slack, Discord and more." },
      { title: "More members", description: "Invite your team without friction." },
    ],
  },
  professional: {
    id: "professional",
    label: "Professional",
    tagline: "Built for teams that need unlimited everything",
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      { title: "Everything in Starter", description: "All starter features included." },
      { title: "Custom domains", description: "Use your own domain for professional branding." },
      { title: "White-label", description: "Remove Featul branding from your workspace." },
      { title: "Unlimited boards", description: "Create unlimited public and private boards." },
      { title: "Unlimited integrations", description: "Connect all your tools without limits." },
    ],
  },
}

const PLAN_ORDER: PlanKey[] = ["free", "starter", "professional"]

function getPlan(plan: PlanKey) {
  return BILLING_PLANS[plan]
}

function formatPrice(plan: PlanOption, cycle: BillingCycle) {
  const amount = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
  if (cycle === "yearly") return `$${amount} / year`
  return `$${amount} / month`
}

type BillingSectionProps = {
  currentPlan?: string
  workspaceId?: string
}

export default function BillingSection({ currentPlan, workspaceId }: BillingSectionProps) {
  const normalizedPlan = normalizePlan(String(currentPlan || "free"))
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <>
      <SectionCard
        title="Manage your plan"
        description="Update your payment information or switch plans."
      >
        <PlanSummaryCard planKey={normalizedPlan} onUpgradeClick={() => setDialogOpen(true)} />
      </SectionCard>

      <UpgradePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPlan={normalizedPlan}
        workspaceId={workspaceId}
      />
    </>
  )
}

type PlanSummaryCardProps = {
  planKey: PlanKey
  onUpgradeClick: () => void
}

function PlanSummaryCard({ planKey, onUpgradeClick }: PlanSummaryCardProps) {
  const plan = getPlan(planKey)

  return (
    <div className="space-y-3 text-foreground">
      <div className="flex items-center justify-between rounded-md border border-border/70 bg-background px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted/80 text-foreground">
            <CreditCard className="size-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-foreground">
              {plan.label} Plan
            </div>
            <div className="text-xs text-accent">{formatPrice(plan, "monthly")}</div>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-md border border-border/70 bg-muted/70 text-foreground">
          Current
        </span>
      </div>
      <div>
        <Button variant="secondary" onClick={onUpgradeClick}>
          Upgrade Plan
        </Button>
      </div>
    </div>
  )
}

type UpgradePlanDialogProps = {
  open: boolean
  onOpenChange: (value: boolean) => void
  currentPlan: PlanKey
  workspaceId?: string
}

function UpgradePlanDialog({ open, onOpenChange, currentPlan, workspaceId }: UpgradePlanDialogProps) {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly")
  const [selectedPlan, setSelectedPlan] = React.useState<PlanKey>(currentPlan)
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setSelectedPlan(currentPlan)
    }
  }, [open, currentPlan])

  const activePlan = getPlan(selectedPlan)
  const isCurrent = selectedPlan === currentPlan

  const handleCheckout = async () => {
    if (isCheckingOut) return
    if (!workspaceId) {
      toast.error("Workspace not found")
      return
    }
    if (selectedPlan === "free") {
      toast.error("Free plan doesn’t require checkout")
      return
    }

    const slug =
      selectedPlan === "starter"
        ? billingCycle === "yearly"
          ? "starter-yearly"
          : "starter-monthly"
        : billingCycle === "yearly"
        ? "professional-yearly"
        : "professional-monthly"

    try {
      setIsCheckingOut(true)
      const { error, data } = await authClient.checkout({
        slug,
        referenceId: workspaceId,
        metadata: {
          plan: selectedPlan,
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
      const message =
        err instanceof Error ? err.message : "Failed to start checkout"
      toast.error(message)
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Upgrade your workspace"
      description="Pick a plan that fits your team. You can change or cancel anytime."
      width="wide"
    >
      <div className="grid gap-5 md:grid-cols-[220px_1fr] p-1">
        <div className="space-y-4">
          <DialogBenefits />
          <PlanOptionList
            selectedPlan={selectedPlan}
            currentPlan={currentPlan}
            billingCycle={billingCycle}
            onSelect={setSelectedPlan}
          />
          <BillingCycleToggle
            billingCycle={billingCycle}
            onChange={setBillingCycle}
          />
        </div>

        <PlanDetailsCard
          plan={activePlan}
          billingCycle={billingCycle}
          isCurrent={isCurrent}
          isCheckingOut={isCheckingOut}
          onCheckout={handleCheckout}
        />
      </div>
    </SettingsDialogShell>
  )
}

function DialogBenefits() {
  return (
    <div className="space-y-2 text-sm text-accent">
      <div className="flex items-start gap-2">
        <Check className="mt-0.5 size-4 text-foreground" />
        <span>Free 14-day trial, cancel anytime.</span>
      </div>
      <div className="flex items-start gap-2">
        <Check className="mt-0.5 size-4 text-foreground" />
        <span>Instant access to all features.</span>
      </div>
    </div>
  )
}

type PlanOptionListProps = {
  selectedPlan: PlanKey
  currentPlan: PlanKey
  billingCycle: BillingCycle
  onSelect: (plan: PlanKey) => void
}

function PlanOptionList({ selectedPlan, currentPlan, billingCycle, onSelect }: PlanOptionListProps) {
  return (
    <div className="space-y-2">
      {PLAN_ORDER.map((planKey) => {
        const plan = getPlan(planKey)
        const isSelected = planKey === selectedPlan
        const isCurrent = planKey === currentPlan

        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelect(planKey)}
            className={cn(
              "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
              isSelected
                ? "border-primary/70 ring-1 ring-primary/30 bg-primary/5"
                : "border-border hover:bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    isSelected ? "bg-primary" : "bg-muted-foreground/40"
                  )}
                />
                <div className="text-sm font-medium text-foreground">
                  {plan.label}
                </div>
                {isCurrent && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md border border-border/70 bg-muted/70 text-foreground">
                    Current
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-foreground">
                {formatPrice(plan, billingCycle)}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

type BillingCycleToggleProps = {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}

function BillingCycleToggle({ billingCycle, onChange }: BillingCycleToggleProps) {
  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">
            Save 2 months with yearly billing
          </div>
          <div className="text-xs text-accent">Pay for 10 months, get 12.</div>
        </div>
        <Switch
          checked={billingCycle === "yearly"}
          onCheckedChange={(checked) =>
            onChange(checked ? "yearly" : "monthly")
          }
        />
      </div>
    </div>
  )
}

type PlanDetailsCardProps = {
  plan: PlanOption
  billingCycle: BillingCycle
  isCurrent: boolean
  isCheckingOut: boolean
  onCheckout: () => void
}

function PlanDetailsCard({ plan, billingCycle, isCurrent, isCheckingOut, onCheckout }: PlanDetailsCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-muted/10 p-5">
      <div className="space-y-1">
        <div className="text-lg font-semibold text-foreground">{plan.label}</div>
        <div className="text-sm text-accent">{plan.tagline}</div>
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-accent">
        What&apos;s included
      </div>

      <div className="space-y-3">
        {plan.features.map((feature) => (
          <div key={feature.title} className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-muted/70 p-1">
              <Check className="size-3.5 text-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {feature.title}
              </div>
              <div className="text-xs text-accent">{feature.description}</div>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full" disabled={isCurrent || isCheckingOut} onClick={onCheckout}>
        {isCurrent ? "Current Plan" : `Upgrade to ${plan.label}`}
      </Button>
    </div>
  )
}

import Stripe from "stripe"
import { eq } from "drizzle-orm"
import { billingNotification, db, subscription, user, workspace } from "@featul/db"
import {
  sendBillingPaymentDueEmail,
  sendBillingPaymentFailedEmail,
  sendBillingUpgradeEmail,
} from "./email"
import { type StripeBillingPlanName } from "./stripe"

type BillingNotificationKind = "upgrade" | "payment_failed" | "payment_due"

type WorkspaceBillingRecipient = {
  workspaceId: string
  workspaceName: string
  workspaceSlug: string
  ownerName: string | null
  ownerEmail: string | null
}

type WorkspaceBillingSubscriptionContext = WorkspaceBillingRecipient & {
  plan: string | null
  billingInterval: string | null
  periodEnd: Date | null
}

function getAppBaseUrl() {
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || "").trim()
  return appUrl || "http://localhost:3000"
}

function buildBillingUrl(workspaceSlug: string) {
  return new URL(`/workspaces/${workspaceSlug}/settings/billing`, getAppBaseUrl()).toString()
}

function formatPlanLabel(plan: string | null | undefined) {
  const value = String(plan || "").trim().toLowerCase()
  if (!value) return "Paid"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatBillingIntervalLabel(interval: string | null | undefined) {
  if (interval === "year") return "yearly"
  if (interval === "month") return "monthly"
  return undefined
}

function formatCurrencyAmount(amount: number | null | undefined, currency: string | null | undefined) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return undefined

  const normalizedCurrency = String(currency || "").trim().toUpperCase() || "USD"

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: normalizedCurrency,
    }).format(amount / 100)
  } catch {
    return `${(amount / 100).toFixed(2)} ${normalizedCurrency}`
  }
}

function formatDate(date: Date | null | undefined) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return undefined

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date)
}

function fromUnixTimestamp(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null
  return new Date(value * 1000)
}

function getStripeSubscriptionId(
  value: string | Stripe.Subscription | null | undefined,
) {
  if (typeof value === "string") return value.trim()
  return String(value?.id || "").trim()
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const parentSubscriptionId = getStripeSubscriptionId(
    invoice.parent?.subscription_details?.subscription || null,
  )
  if (parentSubscriptionId) return parentSubscriptionId

  for (const line of invoice.lines.data) {
    const lineSubscriptionId = getStripeSubscriptionId(line.subscription)
    if (lineSubscriptionId) {
      return lineSubscriptionId
    }
  }

  return ""
}

async function getWorkspaceBillingRecipient(workspaceId: string): Promise<WorkspaceBillingRecipient | null> {
  const [row] = await db
    .select({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      ownerName: user.name,
      ownerEmail: user.email,
    })
    .from(workspace)
    .innerJoin(user, eq(workspace.ownerId, user.id))
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  return row || null
}

async function getSubscriptionContextByStripeSubscriptionId(
  stripeSubscriptionId: string,
): Promise<WorkspaceBillingSubscriptionContext | null> {
  const [row] = await db
    .select({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      ownerName: user.name,
      ownerEmail: user.email,
      plan: subscription.plan,
      billingInterval: subscription.billingInterval,
      periodEnd: subscription.periodEnd,
    })
    .from(subscription)
    .innerJoin(workspace, eq(subscription.referenceId, workspace.id))
    .innerJoin(user, eq(workspace.ownerId, user.id))
    .where(eq(subscription.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1)

  return row || null
}

async function claimBillingNotification(params: {
  workspaceId: string
  kind: BillingNotificationKind
  stripeEventId: string
  stripeInvoiceId?: string | null
}) {
  const [row] = await db
    .insert(billingNotification)
    .values({
      workspaceId: params.workspaceId,
      kind: params.kind,
      stripeEventId: params.stripeEventId,
      stripeInvoiceId: params.stripeInvoiceId || null,
    })
    .onConflictDoNothing()
    .returning({ id: billingNotification.id })

  return row?.id || null
}

async function releaseBillingNotification(claimId: string) {
  await db.delete(billingNotification).where(eq(billingNotification.id, claimId))
}

async function sendClaimedNotification(claimId: string | null, send: () => Promise<void>) {
  if (!claimId) return false

  try {
    await send()
    return true
  } catch (error) {
    await releaseBillingNotification(claimId)
    throw error
  }
}

function logBillingSkip(message: string, details: Record<string, unknown>) {
  console.warn("[billing-email:skip]", message, details)
}

export async function sendWorkspaceUpgradeNotification(params: {
  workspaceId: string
  plan: StripeBillingPlanName
  billingInterval?: string | null
  stripeSubscriptionId?: string | null
  stripeEventId: string
}) {
  const recipient = await getWorkspaceBillingRecipient(params.workspaceId)
  if (!recipient?.ownerEmail) {
    logBillingSkip("workspace owner email missing for upgrade notification", {
      workspaceId: params.workspaceId,
      stripeEventId: params.stripeEventId,
    })
    return false
  }

  const upgradeNotificationKey = [
    "upgrade",
    recipient.workspaceId,
    String(params.stripeSubscriptionId || "").trim() || "no-subscription",
    params.plan,
    String(params.billingInterval || "").trim() || "no-interval",
  ].join(":")

  const claimId = await claimBillingNotification({
    workspaceId: recipient.workspaceId,
    kind: "upgrade",
    stripeEventId: upgradeNotificationKey,
  })

  return sendClaimedNotification(claimId, async () => {
    await sendBillingUpgradeEmail(recipient.ownerEmail!, {
      recipientName: recipient.ownerName || undefined,
      workspaceName: recipient.workspaceName,
      planLabel: formatPlanLabel(params.plan),
      billingIntervalLabel: formatBillingIntervalLabel(params.billingInterval),
      billingUrl: buildBillingUrl(recipient.workspaceSlug),
    })
  })
}

export async function sendFailedPaymentNotificationForInvoice(event: Stripe.Event, invoice: Stripe.Invoice) {
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice)
  if (!stripeSubscriptionId) {
    logBillingSkip("invoice.payment_failed missing subscription id", {
      stripeEventId: event.id,
      stripeInvoiceId: invoice.id,
    })
    return false
  }

  const context = await getSubscriptionContextByStripeSubscriptionId(stripeSubscriptionId)
  if (!context?.ownerEmail) {
    logBillingSkip("workspace owner email missing for failed payment notification", {
      stripeEventId: event.id,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId,
    })
    return false
  }

  const claimId = await claimBillingNotification({
    workspaceId: context.workspaceId,
    kind: "payment_failed",
    stripeEventId: event.id,
    stripeInvoiceId: invoice.id,
  })

  return sendClaimedNotification(claimId, async () => {
    const amountLabel = formatCurrencyAmount(invoice.amount_due, invoice.currency)
    const renewalDate = formatDate(
      context.periodEnd ||
        fromUnixTimestamp(invoice.next_payment_attempt) ||
        fromUnixTimestamp(invoice.due_date),
    )

    await sendBillingPaymentFailedEmail(context.ownerEmail!, {
      recipientName: context.ownerName || undefined,
      workspaceName: context.workspaceName,
      planLabel: formatPlanLabel(context.plan),
      amountLabel: amountLabel ? `Amount due: ${amountLabel}` : undefined,
      dueDateLabel: renewalDate ? `Renewal date: ${renewalDate}` : undefined,
      billingUrl: buildBillingUrl(context.workspaceSlug),
    })
  })
}

export async function sendUpcomingPaymentNotificationForInvoice(event: Stripe.Event, invoice: Stripe.Invoice) {
  const stripeSubscriptionId = getInvoiceSubscriptionId(invoice)
  if (!stripeSubscriptionId) {
    logBillingSkip("invoice.upcoming missing subscription id", {
      stripeEventId: event.id,
      stripeInvoiceId: invoice.id,
    })
    return false
  }

  const context = await getSubscriptionContextByStripeSubscriptionId(stripeSubscriptionId)
  if (!context?.ownerEmail) {
    logBillingSkip("workspace owner email missing for upcoming payment notification", {
      stripeEventId: event.id,
      stripeInvoiceId: invoice.id,
      stripeSubscriptionId,
    })
    return false
  }

  const claimId = await claimBillingNotification({
    workspaceId: context.workspaceId,
    kind: "payment_due",
    stripeEventId: event.id,
    stripeInvoiceId: invoice.id,
  })

  return sendClaimedNotification(claimId, async () => {
    const amountLabel = formatCurrencyAmount(invoice.amount_due, invoice.currency)
    const renewalDate = formatDate(
      context.periodEnd ||
        fromUnixTimestamp(invoice.next_payment_attempt) ||
        fromUnixTimestamp(invoice.due_date),
    )

    await sendBillingPaymentDueEmail(context.ownerEmail!, {
      recipientName: context.ownerName || undefined,
      workspaceName: context.workspaceName,
      planLabel: formatPlanLabel(context.plan),
      amountLabel: amountLabel ? `Amount: ${amountLabel}` : undefined,
      dueDateLabel: renewalDate ? `Renewal date: ${renewalDate}` : undefined,
      billingUrl: buildBillingUrl(context.workspaceSlug),
    })
  })
}

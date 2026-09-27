import Stripe from "stripe"
import { randomUUID } from "node:crypto"
import { and, eq, isNull, sql } from "drizzle-orm"
import { billingNotification, db, subscription, user, workspace } from "@featul/db"
import {
  renderBillingPaymentDueEmail,
  renderBillingPaymentFailedEmail,
  renderBillingUpgradeEmail,
} from "../email/billingemail"
import { sendEmail, type EmailPayload } from "../email/transport"
import { type StripeBillingPlanName } from "../stripe"

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

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
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
  const token = randomUUID()
  const [row] = await db
    .insert(billingNotification)
    .values({
      workspaceId: params.workspaceId,
      kind: params.kind,
      stripeEventId: params.stripeEventId,
      stripeInvoiceId: params.stripeInvoiceId || null,
      lockToken: token,
      lockedUntil: sql`now() + interval '2 minutes'`,
    })
    .onConflictDoUpdate({
      target: billingNotification.stripeEventId,
      set: { lockToken: token, lockedUntil: sql`now() + interval '2 minutes'` },
      setWhere: and(isNull(billingNotification.sentAt), sql`${billingNotification.lockedUntil} is null or ${billingNotification.lockedUntil} < now()`),
    })
    .returning({ id: billingNotification.id, payload: billingNotification.payload })

  if (row) return { ...row, token, key: params.stripeEventId }
  const [existing] = await db.select({ sentAt: billingNotification.sentAt }).from(billingNotification)
    .where(eq(billingNotification.stripeEventId, params.stripeEventId)).limit(1)
  if (!existing?.sentAt) throw new Error("Billing notification is already being delivered")
  return null
}

async function sendClaimedNotification(
  claim: { id: string; token: string; key: string; payload: EmailPayload | null } | null,
  build: () => Promise<EmailPayload>,
) {
  if (!claim) return false
  const condition = and(eq(billingNotification.id, claim.id), eq(billingNotification.lockToken, claim.token))

  try {
    const payload = claim.payload || { ...await build(), from: process.env.RESEND_FROM || "featul <no-reply@featul.com>" }
    if (!claim.payload) {
      const saved = await db.update(billingNotification).set({ payload }).where(condition).returning({ id: billingNotification.id })
      if (!saved.length) throw new Error("Billing notification lease expired")
    }
    // Keep the exact payload across retries: Resend rejects a reused key with
    // different content, e.g. after the owner changes their billing email.
    await sendEmail({ ...payload, idempotencyKey: claim.key })
    await db.update(billingNotification).set({ sentAt: new Date(), lockedUntil: null, lockToken: null }).where(condition)
    return true
  } catch (error) {
    await db.update(billingNotification).set({ lockedUntil: null, lockToken: null }).where(condition)
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

  // Respect activation notifications sent by the pre-migration implementation.
  // Later plan changes use event IDs and must not be suppressed by this key.
  if (params.stripeEventId.startsWith("activation:")) {
    const legacyKey = ["upgrade", params.workspaceId, params.stripeSubscriptionId || "no-subscription",
      params.plan, params.billingInterval || "no-interval"].join(":")
    const [legacy] = await db.select({ sentAt: billingNotification.sentAt }).from(billingNotification)
      .where(eq(billingNotification.stripeEventId, legacyKey)).limit(1)
    if (legacy?.sentAt) return false
  }

  const claimId = await claimBillingNotification({
    workspaceId: recipient.workspaceId,
    kind: "upgrade",
    stripeEventId: params.stripeEventId,
  })

  return sendClaimedNotification(claimId, async () => {
    const rendered = await renderBillingUpgradeEmail({
      recipientName: recipient.ownerName || undefined,
      workspaceName: recipient.workspaceName,
      planLabel: formatPlanLabel(params.plan),
      billingIntervalLabel: formatBillingIntervalLabel(params.billingInterval),
      billingUrl: buildBillingUrl(recipient.workspaceSlug),
    })
    return { to: recipient.ownerEmail!, subject: `Your workspace upgraded to ${formatPlanLabel(params.plan)}`, ...rendered }
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

    const rendered = await renderBillingPaymentFailedEmail({
      recipientName: context.ownerName || undefined,
      workspaceName: context.workspaceName,
      planLabel: formatPlanLabel(context.plan),
      amountLabel: amountLabel ? `Amount due: ${amountLabel}` : undefined,
      dueDateLabel: renewalDate ? `Renewal date: ${renewalDate}` : undefined,
      billingUrl: buildBillingUrl(context.workspaceSlug),
    })
    return { to: context.ownerEmail!, subject: `Payment failed for ${context.workspaceName}`, ...rendered }
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

    const rendered = await renderBillingPaymentDueEmail({
      recipientName: context.ownerName || undefined,
      workspaceName: context.workspaceName,
      planLabel: formatPlanLabel(context.plan),
      amountLabel: amountLabel ? `Amount: ${amountLabel}` : undefined,
      dueDateLabel: renewalDate ? `Renewal date: ${renewalDate}` : undefined,
      billingUrl: buildBillingUrl(context.workspaceSlug),
    })
    return { to: context.ownerEmail!, subject: `Upcoming renewal for ${context.workspaceName}`, ...rendered }
  })
}

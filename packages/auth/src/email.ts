import { renderWelcomeEmail } from "./email/welcomeemail"
import { renderVerifyEmail, VerifyType } from "./email/verifyemail"
import { renderInviteEmail } from "./email/inviteemail"
import type { Brand } from "./email/brandemail"
import { sendEmail } from "./email/transport"
import { renderReserveEmail } from "./email/reserveemail"
import { renderReportEmail, type ReportEmailProps } from "./email/reportemail"
import { db, user } from "@featul/db"
import { eq } from "drizzle-orm"
import {
  renderBillingPaymentDueEmail,
  renderBillingPaymentFailedEmail,
  renderBillingUpgradeEmail,
} from "./email/billingemail"

export type BillingUpgradeEmailProps = {
  recipientName?: string
  workspaceName: string
  planLabel: string
  billingIntervalLabel?: string
  billingUrl: string
  brand?: Brand
}

export type BillingPaymentFailedEmailProps = {
  recipientName?: string
  workspaceName: string
  planLabel: string
  amountLabel?: string
  dueDateLabel?: string
  billingUrl: string
  brand?: Brand
}

export type BillingPaymentDueEmailProps = {
  recipientName?: string
  workspaceName: string
  planLabel: string
  amountLabel?: string
  dueDateLabel?: string
  billingUrl: string
  brand?: Brand
}

type RecipientEmailOptions = {
  brand?: Brand
  recipientName?: string
}

type InviteEmailOptions = RecipientEmailOptions & {
  inviterName?: string
}

const GENERIC_EMAIL_ALIASES = new Set([
  "admin",
  "billing",
  "contact",
  "hello",
  "info",
  "noreply",
  "no-reply",
  "notifications",
  "support",
  "team",
])

function isRecipientOptions(options: Brand | RecipientEmailOptions | InviteEmailOptions | undefined): options is RecipientEmailOptions | InviteEmailOptions {
  return Boolean(
    options &&
      typeof options === "object" &&
      ("recipientName" in options || "inviterName" in options || "brand" in options),
  )
}

function normalizeRecipientOptions<T extends RecipientEmailOptions>(options?: Brand | T): T {
  if (isRecipientOptions(options)) {
    return options as T
  }

  return { brand: options as Brand | undefined } as T
}

function fallbackRecipientNameFromEmail(email: string) {
  const localPart = String(email || "").trim().toLowerCase().split("@")[0]?.split("+")[0] || ""
  if (!localPart) return undefined

  const normalized = localPart.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim()
  const compact = normalized.replace(/\s+/g, "")
  if (!normalized || GENERIC_EMAIL_ALIASES.has(compact)) return undefined

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

async function resolveRecipientName(to: string, preferredName?: string) {
  const explicitName = String(preferredName || "").trim()
  if (explicitName) return explicitName

  const normalizedEmail = String(to || "").trim().toLowerCase()
  if (!normalizedEmail) return undefined

  try {
    const [existingUser] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1)

    const existingName = String(existingUser?.name || "").trim()
    if (existingName) return existingName
  } catch {}

  return fallbackRecipientNameFromEmail(normalizedEmail)
}

export async function sendWelcome(to: string, name?: string, brand?: Brand) {
  const recipientName = await resolveRecipientName(to, name)
  const { html, text } = await renderWelcomeEmail(recipientName, brand)
  await sendEmail({ to, subject: "Welcome to featul", html, text })
}

export async function sendVerificationOtpEmail(to: string, otp: string, type: VerifyType, options?: Brand | RecipientEmailOptions) {
  const normalizedOptions = normalizeRecipientOptions(options)
  const recipientName = await resolveRecipientName(to, normalizedOptions.recipientName)
  const subject = type === "email-verification" ? "Verify your featul email" : type === "forget-password" ? "Reset your featul password" : "Your featul sign-in code"
  const { html, text } = await renderVerifyEmail(otp, type, {
    brand: normalizedOptions.brand,
    recipientName,
  })
  await sendEmail({ to, subject, html, text })
}

export async function sendWorkspaceInvite(to: string, workspaceName: string, inviteUrl: string, options?: Brand | InviteEmailOptions) {
  const normalizedOptions = normalizeRecipientOptions<InviteEmailOptions>(options)
  const recipientName = await resolveRecipientName(to, normalizedOptions.recipientName)
  const subject = `Join ${workspaceName} on featul`
  const { html, text } = await renderInviteEmail(workspaceName, inviteUrl, {
    brand: normalizedOptions.brand,
    recipientName,
    inviterName: normalizedOptions.inviterName,
  })
  await sendEmail({ to, subject, html, text })
}

export async function sendReservationEmail(to: string, slug: string, confirmUrl: string, options?: Brand | RecipientEmailOptions) {
  const normalizedOptions = normalizeRecipientOptions(options)
  const recipientName = await resolveRecipientName(to, normalizedOptions.recipientName)
  const subject = `Reserve ${slug}.featul.com`
  const { html, text } = await renderReserveEmail(slug, confirmUrl, {
    brand: normalizedOptions.brand,
    recipientName,
  })
  await sendEmail({ to, subject, html, text })
}
export async function sendReportEmail(to: string, props: ReportEmailProps) {
  const recipientName = await resolveRecipientName(to, props.recipientName)
  const subject = `Report: ${props.itemName}`
  const { html, text } = await renderReportEmail({
    ...props,
    recipientName,
  })
  await sendEmail({ to, subject, html, text })
}

export async function sendBillingUpgradeEmail(to: string, props: BillingUpgradeEmailProps) {
  const recipientName = await resolveRecipientName(to, props.recipientName)
  const subject = `Your workspace upgraded to ${props.planLabel}`
  const { html, text } = await renderBillingUpgradeEmail({
    ...props,
    recipientName,
  })
  await sendEmail({ to, subject, html, text })
}

export async function sendBillingPaymentFailedEmail(to: string, props: BillingPaymentFailedEmailProps) {
  const recipientName = await resolveRecipientName(to, props.recipientName)
  const subject = `Payment failed for ${props.workspaceName}`
  const { html, text } = await renderBillingPaymentFailedEmail({
    ...props,
    recipientName,
  })
  await sendEmail({ to, subject, html, text })
}

export async function sendBillingPaymentDueEmail(to: string, props: BillingPaymentDueEmailProps) {
  const recipientName = await resolveRecipientName(to, props.recipientName)
  const subject = `Upcoming renewal for ${props.workspaceName}`
  const { html, text } = await renderBillingPaymentDueEmail({
    ...props,
    recipientName,
  })
  await sendEmail({ to, subject, html, text })
}

import { renderWelcomeEmail } from "./email/welcomeemail"
import { renderVerifyEmail, VerifyType } from "./email/verifyemail"
import { renderInviteEmail } from "./email/inviteemail"
import type { Brand } from "./email/brandemail"
import { sendEmail } from "./email/transport"
import { renderReserveEmail } from "./email/reserveemail"
import { renderReportEmail, type ReportEmailProps } from "./email/reportemail"
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

export async function sendWelcome(to: string, name?: string, brand?: Brand) {
  const { html, text } = await renderWelcomeEmail(name, brand)
  await sendEmail({ to, subject: "Welcome to featul", html, text })
}

export async function sendVerificationOtpEmail(to: string, otp: string, type: VerifyType, brand?: Brand) {
  const subject = type === "email-verification" ? "Verify your featul email" : type === "forget-password" ? "Reset your featul password" : "Your featul sign-in code"
  const { html, text } = await renderVerifyEmail(otp, type, brand)
  await sendEmail({ to, subject, html, text })
}

export async function sendWorkspaceInvite(to: string, workspaceName: string, inviteUrl: string, brand?: Brand) {
  const subject = `Join ${workspaceName} on featul`
  const { html, text } = await renderInviteEmail(workspaceName, inviteUrl, brand)
  await sendEmail({ to, subject, html, text })
}

export async function sendReservationEmail(to: string, slug: string, confirmUrl: string, brand?: Brand) {
  const subject = `Reserve ${slug}.featul.com`
  const { html, text } = await renderReserveEmail(slug, confirmUrl, brand)
  await sendEmail({ to, subject, html, text })
}
export async function sendReportEmail(to: string, props: ReportEmailProps) {
  const subject = `Report: ${props.itemName}`
  const { html, text } = await renderReportEmail(props)
  await sendEmail({ to, subject, html, text })
}

export async function sendBillingUpgradeEmail(to: string, props: BillingUpgradeEmailProps) {
  const subject = `Your workspace upgraded to ${props.planLabel}`
  const { html, text } = await renderBillingUpgradeEmail(props)
  await sendEmail({ to, subject, html, text })
}

export async function sendBillingPaymentFailedEmail(to: string, props: BillingPaymentFailedEmailProps) {
  const subject = `Payment failed for ${props.workspaceName}`
  const { html, text } = await renderBillingPaymentFailedEmail(props)
  await sendEmail({ to, subject, html, text })
}

export async function sendBillingPaymentDueEmail(to: string, props: BillingPaymentDueEmailProps) {
  const subject = `Upcoming renewal for ${props.workspaceName}`
  const { html, text } = await renderBillingPaymentDueEmail(props)
  await sendEmail({ to, subject, html, text })
}

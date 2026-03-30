import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, type Brand } from "./brandemail"

type BillingEmailProps = {
  recipientName?: string
  workspaceName: string
  planLabel: string
  billingUrl: string
  brand?: Brand
}

type UpgradeEmailProps = BillingEmailProps & {
  billingIntervalLabel?: string
}

type PaymentFailedEmailProps = BillingEmailProps & {
  amountLabel?: string
  dueDateLabel?: string
}

type PaymentDueEmailProps = BillingEmailProps & {
  amountLabel?: string
  dueDateLabel?: string
}

export function BillingUpgradeEmail({
  recipientName,
  workspaceName,
  planLabel,
  billingIntervalLabel,
  billingUrl,
  brand,
}: UpgradeEmailProps) {
  const intervalText = billingIntervalLabel ? ` on ${billingIntervalLabel} billing` : ""
  const intro = recipientName ? `Hello ${recipientName},` : "Hello,"

  return (
    <BrandedEmail
      eyebrow="BILLING"
      title={`Your ${workspaceName} workspace is now on ${planLabel}`}
      intro={intro}
      body={`Your workspace ${workspaceName} has been upgraded to the ${planLabel} plan${intervalText}.`}
      paragraphs={[
        "Your paid features are now available.",
        "You can review your subscription details, billing history, and payment method from the billing settings page.",
      ]}
      ctaText="Manage billing"
      ctaUrl={billingUrl}
      psText="If you did not expect this billing change, please review your billing settings right away."
      signatureName={`${brand?.name || "featul"} Billing`}
      brand={brand}
    />
  )
}

export function BillingPaymentFailedEmail({
  recipientName,
  workspaceName,
  planLabel,
  amountLabel,
  dueDateLabel,
  billingUrl,
  brand,
}: PaymentFailedEmailProps) {
  const detail = [amountLabel, dueDateLabel].filter(Boolean).join(" • ")
  const intro = recipientName ? `Hello ${recipientName},` : "Hello,"

  return (
    <BrandedEmail
      eyebrow="BILLING"
      title={`Payment failed for ${workspaceName}`}
      intro={intro}
      body={`We were unable to process the latest payment for your workspace ${workspaceName} on the ${planLabel} plan.`}
      paragraphs={[
        detail ? `Payment details: ${detail}.` : "Please review your payment method and billing settings.",
        "Updating your payment method in billing is usually the fastest way to restore successful renewals.",
      ]}
      ctaText="Update billing"
      ctaUrl={billingUrl}
      psText="If your bank blocked the charge, retrying after updating your payment method often resolves the issue."
      signatureName={`${brand?.name || "featul"} Billing`}
      brand={brand}
    />
  )
}

export function BillingPaymentDueEmail({
  recipientName,
  workspaceName,
  planLabel,
  amountLabel,
  dueDateLabel,
  billingUrl,
  brand,
}: PaymentDueEmailProps) {
  const detail = [amountLabel, dueDateLabel].filter(Boolean).join(" • ")
  const intro = recipientName ? `Hello ${recipientName},` : "Hello,"

  return (
    <BrandedEmail
      eyebrow="BILLING"
      title={`Upcoming renewal for ${workspaceName}`}
      intro={intro}
      body={`This is a reminder that your workspace ${workspaceName} on the ${planLabel} plan is scheduled to renew soon.`}
      paragraphs={[
        detail ? `Renewal details: ${detail}.` : "You can review the renewal timing and payment method in your billing settings.",
        "No action is needed if your payment method is up to date.",
      ]}
      ctaText="Review billing"
      ctaUrl={billingUrl}
      psText="You are receiving this reminder three days before the scheduled renewal."
      signatureName={`${brand?.name || "featul"} Billing`}
      brand={brand}
    />
  )
}

export async function renderBillingUpgradeEmail(props: UpgradeEmailProps) {
  const html = await render(<BillingUpgradeEmail {...props} />)
  const text = toPlainText(html)
  return { html, text }
}

export async function renderBillingPaymentFailedEmail(props: PaymentFailedEmailProps) {
  const html = await render(<BillingPaymentFailedEmail {...props} />)
  const text = toPlainText(html)
  return { html, text }
}

export async function renderBillingPaymentDueEmail(props: PaymentDueEmailProps) {
  const html = await render(<BillingPaymentDueEmail {...props} />)
  const text = toPlainText(html)
  return { html, text }
}

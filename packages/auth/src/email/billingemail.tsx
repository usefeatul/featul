import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, type Brand, type EmailDetail } from "./brandemail"

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

function greeting(name?: string) {
  return name ? `Hi ${name},` : "Hi,"
}

function paymentDetails(amountLabel?: string, dueDateLabel?: string): EmailDetail[] {
  const details: EmailDetail[] = []
  if (amountLabel) details.push({ label: "Amount", value: amountLabel })
  if (dueDateLabel) details.push({ label: "Date", value: dueDateLabel })
  return details
}

export function BillingUpgradeEmail({
  recipientName,
  workspaceName,
  planLabel,
  billingIntervalLabel,
  billingUrl,
  brand,
}: UpgradeEmailProps) {
  const details: EmailDetail[] = [
    { label: "Workspace", value: workspaceName },
    { label: "Plan", value: planLabel },
  ]
  if (billingIntervalLabel) details.push({ label: "Billing", value: billingIntervalLabel })

  return (
    <BrandedEmail
      title={`${workspaceName} is now on ${planLabel}`}
      intro={greeting(recipientName)}
      body="Paid features are available. You can review the subscription anytime."
      details={details}
      ctaText="Manage billing"
      ctaUrl={billingUrl}
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
  return (
    <BrandedEmail
      title={`Payment failed for ${workspaceName}`}
      intro={greeting(recipientName)}
      body={`We could not process the latest payment for the ${planLabel} plan. Update your payment method to keep the workspace active.`}
      details={paymentDetails(amountLabel, dueDateLabel)}
      ctaText="Update billing"
      ctaUrl={billingUrl}
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
  return (
    <BrandedEmail
      title={`Upcoming renewal for ${workspaceName}`}
      intro={greeting(recipientName)}
      body={`${workspaceName} on the ${planLabel} plan renews soon. No action is needed if your payment method is current.`}
      details={paymentDetails(amountLabel, dueDateLabel)}
      ctaText="Review billing"
      ctaUrl={billingUrl}
      psText="This reminder is sent three days before renewal."
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

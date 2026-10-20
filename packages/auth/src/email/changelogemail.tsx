import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export interface ChangelogPublishedEmailProps {
  recipientName?: string
  workspaceName: string
  entryTitle: string
  entrySummary?: string
  entryUrl: string
  unsubscribeUrl: string
  brand?: Brand
}

export function ChangelogPublishedEmail({
  recipientName,
  workspaceName,
  entryTitle,
  entrySummary,
  entryUrl,
  unsubscribeUrl,
  brand,
}: ChangelogPublishedEmailProps) {
  return (
    <BrandedEmail
      eyebrow={`${workspaceName} changelog`}
      title={entryTitle}
      intro={`Hi ${recipientName || "there"},`}
      body={`${workspaceName} just published a new update.`}
      paragraphs={entrySummary ? [entrySummary] : undefined}
      ctaText="Read the update"
      ctaUrl={entryUrl}
      brand={brand}
      unsubscribeUrl={unsubscribeUrl}
      unsubscribeText={`You're receiving this because you subscribed to the ${workspaceName} changelog.`}
    />
  )
}

export async function renderChangelogPublishedEmail(props: ChangelogPublishedEmailProps) {
  const element = <ChangelogPublishedEmail {...props} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

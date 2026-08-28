import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export interface StatusChangeEmailProps {
  recipientName?: string
  workspaceName: string
  postTitle: string
  postUrl: string
  fromStatusLabel: string
  toStatusLabel: string
  brand?: Brand
}

export function StatusChangeEmail({
  recipientName,
  workspaceName,
  postTitle,
  postUrl,
  fromStatusLabel,
  toStatusLabel,
  brand,
}: StatusChangeEmailProps) {
  return (
    <BrandedEmail
      title={`${postTitle} is now ${toStatusLabel}`}
      intro={`Hi ${recipientName || "there"},`}
      body={`A feedback item you follow in ${workspaceName} changed status.`}
      details={[
        { label: "From", value: fromStatusLabel },
        { label: "To", value: toStatusLabel },
      ]}
      ctaText="View feedback"
      ctaUrl={postUrl}
      brand={brand}
    />
  )
}

export async function renderStatusChangeEmail(props: StatusChangeEmailProps) {
  const element = <StatusChangeEmail {...props} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

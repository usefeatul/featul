import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export interface ReportEmailProps {
  recipientName?: string
  workspaceName: string
  itemName: string
  itemUrl: string
  itemType: "post" | "comment"
  reason: string
  description?: string | null
  reportCount: number
  brand?: Brand
}

export function ReportEmail({
  recipientName,
  workspaceName,
  itemName,
  itemUrl,
  itemType,
  reason,
  description,
  reportCount,
  brand,
}: ReportEmailProps) {
  const details = [
    { label: "Item", value: itemName },
    { label: "Reason", value: reason },
    description ? { label: "Details", value: description } : null,
    { label: "Reports", value: String(reportCount) },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <BrandedEmail
      title={`A ${itemType} was reported in ${workspaceName}`}
      intro={`Hi ${recipientName || "there"},`}
      body={reportCount >= 3 ? "This content has reached 3 or more reports." : "A new report needs a look."}
      details={details}
      ctaText={itemType === "post" ? "View post" : "View comment"}
      ctaUrl={itemUrl}
      brand={brand}
    />
  )
}

export async function renderReportEmail(props: ReportEmailProps) {
  const element = <ReportEmail {...props} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

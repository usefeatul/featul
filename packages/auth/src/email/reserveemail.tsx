import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, type Brand } from "./brandemail"

type ReserveSlugEmailProps = {
  slug: string
  confirmUrl: string
  recipientName?: string
  brand?: Brand
}

export function ReserveSlugEmail({ slug, confirmUrl, recipientName, brand }: ReserveSlugEmailProps) {
  return (
    <BrandedEmail
      title={`Reserve ${slug}.featul.com`}
      intro={`Hi ${recipientName || "there"},`}
      body={`Confirm to reserve ${slug}.featul.com for your workspace.`}
      ctaText="Confirm reservation"
      ctaUrl={confirmUrl}
      psText="If you did not request this, you can ignore this email."
      brand={brand}
    />
  )
}

export async function renderReserveEmail(slug: string, confirmUrl: string, options?: { recipientName?: string; brand?: Brand }) {
  const element = <ReserveSlugEmail slug={slug} confirmUrl={confirmUrl} recipientName={options?.recipientName} brand={options?.brand} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

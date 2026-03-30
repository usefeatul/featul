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
  const eyebrow = "RESERVE"
  const title = `Reserve ${slug}.featul.com`
  const intro = `Hello ${recipientName || "there"},`
  const body = `You requested to reserve the subdomain ${slug}.featul.com.`
  const paragraphs = ["Click the button below to confirm your reservation."]
  const ctaText = "Confirm Reservation"
  const ctaUrl = confirmUrl
  const psText = "If you did not request this, you may safely ignore this email."
  const signatureName = (brand?.name || "featul") + " Team"
  return (
    <BrandedEmail
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      body={body}
      paragraphs={paragraphs}
      ctaText={ctaText}
      ctaUrl={ctaUrl}
      psText={psText}
      signatureName={signatureName}
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

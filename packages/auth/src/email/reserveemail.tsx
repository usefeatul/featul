import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, type Brand } from "./brandemail"

export function ReserveSlugEmail({ slug, confirmUrl, brand }: { slug: string; confirmUrl: string; brand?: Brand }) {
  const eyebrow = "RESERVE"
  const title = `Reserve ${slug}.feedgot.com`
  const intro = "Hello,"
  const body = `You requested to reserve the subdomain ${slug}.feedgot.com.`
  const paragraphs = ["Click the button below to confirm your reservation."]
  const ctaText = "Confirm Reservation"
  const ctaUrl = confirmUrl
  const psText = "If you did not request this, you may safely ignore this email."
  const signatureName = (brand?.name || "Feedgot") + " Team"
  const addressLines = ["267 Kentlands Boulevard PMB #5123", "Gaithersburg, MD 20878, United States"]
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
      addressLines={addressLines}
      brand={brand}
    />
  )
}

export async function renderReserveEmail(slug: string, confirmUrl: string, brand?: Brand) {
  const element = <ReserveSlugEmail slug={slug} confirmUrl={confirmUrl} brand={brand} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export function WelcomeEmail({ name, brand }: { name?: string; brand?: Brand }) {
  const product = brand?.name || "featul"
  return (
    <BrandedEmail
      title={`Welcome to ${product}`}
      intro={`Hi ${name?.trim() || "there"},`}
      body="Your account is ready. You can sign in and start collecting feedback whenever you are."
      ctaText="Open dashboard"
      ctaUrl="https://featul.com/dashboard"
      psText="Reply to this email if you need a hand getting started."
      brand={brand}
    />
  )
}

export async function renderWelcomeEmail(name?: string, brand?: Brand) {
  const element = <WelcomeEmail name={name} brand={brand} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandedemail"

export function WelcomeEmail({ name, brand }: { name?: string; brand?: Brand }) {
  const eyebrow = "Welcome"
  const title = "Welcome to Feedgot"
  const intro = `Hi ${name?.trim() || "there"}!`
  const body = "Thanks for signing up. We’re excited to have you on board."
  const footerText = "You can start exploring your dashboard anytime."
  return (
    <BrandedEmail
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      body={body}
      footerText={footerText}
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
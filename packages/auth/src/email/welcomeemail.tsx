import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export function WelcomeEmail({ name, brand }: { name?: string; brand?: Brand }) {
  const eyebrow = "WELCOME"
  const title = brand?.name ? `Welcome to ${brand.name}` : "Welcome to oreilla"
  const intro = `Hello ${name?.trim() || "there"},`
  const body = "Thank you for creating your account."
  const paragraphs = [
    `Your account is now ready. You may sign in and begin exploring the features available to you.`,
    `If you have any questions or require assistance, please do not hesitate to reach out to our support team.`,
  ]
  const ctaText = "Visit Dashboard"
  const ctaUrl = "https://oreilla.com/dashboard"
  const psText = "Should you need help getting started, simply reply to this email and our team will be happy to assist."
  const signatureName = brand?.name ? `${brand.name} Support` : "oreilla Support"
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

export async function renderWelcomeEmail(name?: string, brand?: Brand) {
  const element = <WelcomeEmail name={name} brand={brand} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}
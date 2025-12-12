import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export type VerifyType = "email-verification" | "forget-password" | "sign-in"

export function VerifyEmail({ otp, type, brand }: { otp: string; type: VerifyType; brand?: Brand }) {
  const eyebrow = "SECURITY"
  const title = type === "email-verification" ? "Verify your email" : type === "forget-password" ? "Reset your password" : "Sign in code"
  const intro = "Hello,"
  const body = type === "email-verification"
    ? "Please use the verification code below."
    : type === "forget-password"
    ? "Please use the reset code below."
    : "Please use the sign-in code below."
  const paragraphs = [
    type === "email-verification"
      ? "To ensure the security of your account, we require email verification."
      : type === "forget-password"
      ? "To protect your account, we require confirmation of this password reset request."
      : "To complete your sign-in, please enter the code provided below.",
  ]
  const outro = "This code will expire in five minutes."
  const ctaText = type === "forget-password" ? "Reset Password" : "Open Dashboard"
  const ctaUrl = type === "forget-password" ? "https://oreilla.com/reset" : "https://oreilla.com/dashboard"
  const psText = "If you require assistance, please reply to this message and our support team will respond promptly."
  const signatureName = "oreilla Support"
  return (
    <BrandedEmail
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      body={body}
      paragraphs={paragraphs}
      outro={outro}
      highlight={otp}
      ctaText={ctaText}
      ctaUrl={ctaUrl}
      psText={psText}
      signatureName={signatureName}
      brand={brand}
    />
  )
}

export async function renderVerifyEmail(otp: string, type: VerifyType, brand?: Brand) {
  const element = <VerifyEmail otp={otp} type={type} brand={brand} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}
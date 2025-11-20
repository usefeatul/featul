import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandedemail"

type VerifyType = "email-verification" | "forget-password" | "sign-in"

export function VerifyEmail({ otp, type, brand }: { otp: string; type: VerifyType; brand?: Brand }) {
  const eyebrow = "Security"
  const title = type === "email-verification" ? "Verify your email" : type === "forget-password" ? "Reset your password" : "Sign in code"
  const intro = "Hi there!"
  const body = type === "email-verification"
    ? "Use this code to verify your email."
    : type === "forget-password"
    ? "Use this code to reset your password."
    : "Use this code to sign in."
  const outro = "This code expires in 5 minutes."
  return (
    <BrandedEmail
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      body={body}
      highlight={otp}
      footerText={"If you didn’t request this, you can ignore this email."}
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
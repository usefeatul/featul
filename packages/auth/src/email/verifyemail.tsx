import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export type VerifyType = "email-verification" | "forget-password" | "sign-in"

type VerifyEmailOptions = {
  otp: string
  type: VerifyType
  recipientName?: string
  brand?: Brand
}

function copyFor(type: VerifyType) {
  if (type === "email-verification") {
    return {
      title: "Verify your email",
      body: "Enter this code to verify your email address.",
    }
  }
  if (type === "forget-password") {
    return {
      title: "Reset your password",
      body: "Enter this code to reset your password.",
    }
  }
  return {
    title: "Your sign-in code",
    body: "Enter this code to finish signing in.",
  }
}

export function VerifyEmail({ otp, type, recipientName, brand }: VerifyEmailOptions) {
  const copy = copyFor(type)
  return (
    <BrandedEmail
      title={copy.title}
      intro={`Hi ${recipientName || "there"},`}
      body={copy.body}
      highlight={otp}
      highlightHint="Expires in 5 minutes"
      psText="If you did not request this, you can ignore this email."
      brand={brand}
    />
  )
}

export async function renderVerifyEmail(otp: string, type: VerifyType, options?: { recipientName?: string; brand?: Brand }) {
  const element = <VerifyEmail otp={otp} type={type} recipientName={options?.recipientName} brand={options?.brand} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

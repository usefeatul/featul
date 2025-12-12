import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

export function InviteWorkspaceEmail({ workspaceName, inviteUrl, brand }: { workspaceName: string; inviteUrl: string; brand?: Brand }) {
  const eyebrow = "INVITE"
  const title = `Join ${workspaceName}`
  const intro = "Hello,"
  const body = `You have been invited to join the workspace ${workspaceName}.`
  const paragraphs = [
    "Click the button below to accept your invite.",
  ]
  const ctaText = "Accept Invite"
  const ctaUrl = inviteUrl
  const psText = "If you did not expect this invitation, you may safely ignore this email."
  const signatureName = (brand?.name || "oreilla") + " Team"

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

export async function renderInviteEmail(workspaceName: string, inviteUrl: string, brand?: Brand) {
  const element = <InviteWorkspaceEmail workspaceName={workspaceName} inviteUrl={inviteUrl} brand={brand} />
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}


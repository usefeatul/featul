import React from "react"
import { render, toPlainText } from "@react-email/render"
import { BrandedEmail, Brand } from "./brandemail"

type InviteWorkspaceEmailProps = {
  workspaceName: string
  inviteUrl: string
  recipientName?: string
  inviterName?: string
  brand?: Brand
}

export function InviteWorkspaceEmail({ workspaceName, inviteUrl, recipientName, inviterName, brand }: InviteWorkspaceEmailProps) {
  const eyebrow = "INVITE"
  const title = `Join ${workspaceName}`
  const intro = `Hello ${recipientName || "there"},`
  const body = inviterName
    ? `${inviterName} invited you to join the ${workspaceName} workspace.`
    : `You have been invited to join the ${workspaceName} workspace.`
  const paragraphs = [
    "Click the button below to accept your invite.",
  ]
  const ctaText = "Accept Invite"
  const ctaUrl = inviteUrl
  const psText = "If you did not expect this invitation, you may safely ignore this email."
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

export async function renderInviteEmail(
  workspaceName: string,
  inviteUrl: string,
  options?: { recipientName?: string; inviterName?: string; brand?: Brand },
) {
  const element = (
    <InviteWorkspaceEmail
      workspaceName={workspaceName}
      inviteUrl={inviteUrl}
      recipientName={options?.recipientName}
      inviterName={options?.inviterName}
      brand={options?.brand}
    />
  )
  const html = await render(element)
  const text = toPlainText(html)
  return { html, text }
}

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
  return (
    <BrandedEmail
      title={`Join ${workspaceName}`}
      intro={`Hi ${recipientName || "there"},`}
      body={
        inviterName
          ? `${inviterName} invited you to the ${workspaceName} workspace.`
          : `You have been invited to the ${workspaceName} workspace.`
      }
      ctaText="Accept invite"
      ctaUrl={inviteUrl}
      psText="If you were not expecting this, you can ignore this email."
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

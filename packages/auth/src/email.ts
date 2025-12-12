import { renderWelcomeEmail } from "./email/welcomeemail"
import { renderVerifyEmail, VerifyType } from "./email/verifyemail"
import { renderInviteEmail } from "./email/inviteemail"
import type { Brand } from "./email/brandemail"
import { sendEmail } from "./email/transport"
import { renderReserveEmail } from "./email/reserveemail"

export async function sendWelcome(to: string, name?: string, brand?: Brand) {
  const { html, text } = await renderWelcomeEmail(name, brand)
  await sendEmail({ to, subject: "Welcome to oreilla", html, text })
}

export async function sendVerificationOtpEmail(to: string, otp: string, type: VerifyType, brand?: Brand) {
  const subject = type === "email-verification" ? "Verify your oreilla email" : type === "forget-password" ? "Reset your oreilla password" : "Your oreilla sign-in code"
  const { html, text } = await renderVerifyEmail(otp, type, brand)
  await sendEmail({ to, subject, html, text })
}

export async function sendWorkspaceInvite(to: string, workspaceName: string, inviteUrl: string, brand?: Brand) {
  const subject = `Join ${workspaceName} on oreilla`
  const { html, text } = await renderInviteEmail(workspaceName, inviteUrl, brand)
  await sendEmail({ to, subject, html, text })
}

export async function sendReservationEmail(to: string, slug: string, confirmUrl: string, brand?: Brand) {
  const subject = `Reserve ${slug}.oreilla.com`
  const { html, text } = await renderReserveEmail(slug, confirmUrl, brand)
  await sendEmail({ to, subject, html, text })
}

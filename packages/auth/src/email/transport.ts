export type EmailPayload = {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || "oreilla <no-reply@oreilla.com>"

  if (!apiKey) {
    console.log(`[email:dev] to=${to} subject=${subject}`)
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  })

  if (!res.ok) {
    const bodyText = await res.text()
    if (res.status === 403 && process.env.NODE_ENV !== "production") {
      console.warn(`[email:test-only] to=${to} subject=${subject} reason=${bodyText}`)
      return
    }
    console.error("Resend email failed", res.status, bodyText)
    throw new Error("Failed to send email")
  }
}
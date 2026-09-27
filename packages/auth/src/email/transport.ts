export type EmailPayload = {
  to: string
  from?: string
  subject: string
  html?: string
  text?: string
  idempotencyKey?: string
}

export async function sendEmail({ to, from: explicitFrom, subject, html, text, idempotencyKey }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = explicitFrom || process.env.RESEND_FROM || "featul <no-reply@featul.com>"

  if (!apiKey) {
    if (idempotencyKey && process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required for billing notifications")
    }
    console.log(`[email:dev] to=${to} subject=${subject}`)
    return
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({ from, to, subject, html, text }),
    signal: AbortSignal.timeout(10_000),
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

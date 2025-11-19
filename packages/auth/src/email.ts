type EmailPayload = {
  to: string
  subject: string
  html?: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM || "Feedgot <onboarding@resend.dev>"

  if (!apiKey) {
    console.log(`[email:dev] to=${to} subject=${subject}`)
    if (html) console.log(html)
    if (text) console.log(text)
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
    const body = await res.text()
    console.error("Resend email failed", res.status, body)
    throw new Error("Failed to send email")
  }
}
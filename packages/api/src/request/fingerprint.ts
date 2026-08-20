import { createHash } from "crypto"

export function getRequestFingerprint(req: Request, provided?: string): string {
  const normalized = String(provided || "").trim()
  if (normalized) return normalized

  const forwardedFor = String(req.headers.get("x-forwarded-for") || "")
    .split(",")[0]
    ?.trim() || ""
  const userAgent = String(req.headers.get("user-agent") || "").trim()
  const acceptLanguage = String(req.headers.get("accept-language") || "").trim()
  const basis = `${forwardedFor}|${userAgent}|${acceptLanguage}`

  if (!basis.replace(/\|/g, "")) {
    const randomPart = Math.random().toString(16).slice(2)
    return `${Date.now()}-${randomPart}`
  }

  return createHash("sha256").update(basis).digest("hex")
}

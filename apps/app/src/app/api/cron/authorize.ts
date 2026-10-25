import { createHash, timingSafeEqual } from "node:crypto"

const digest = (value: string) => createHash("sha256").update(value).digest()

/** Bearer CRON_SECRET check; a missing secret always fails. Equal-length digests keep the compare constant-time. */
export function isAuthorizedCron(request: Request): boolean {
  const secret = String(process.env.CRON_SECRET || "").trim()
  if (!secret) return false
  const header = request.headers.get("authorization") || ""
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`))
}

import { createHash } from "crypto"
import { getClientIp } from "./ip"

/**
 * Server-derived anonymous identity. Client-supplied fingerprints are ignored
 * so visitors cannot mint unlimited votes. NEXT-DOS-001.
 */
export function getRequestFingerprint(req: Request, _provided?: string): string {
  const ip = getClientIp(req)
  const userAgent = String(req.headers.get("user-agent") || "").trim()
  const basis = `${ip}|${userAgent}`

  if (!basis.replace(/\|/g, "")) {
    return createHash("sha256").update("unknown").digest("hex")
  }

  return createHash("sha256").update(basis).digest("hex")
}

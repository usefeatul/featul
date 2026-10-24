import { createHash } from "crypto"
import { isIP } from "node:net"
import { getClientIp } from "./ip"

/** IPv6 clients usually hold a whole /64, so bucket by prefix rather than address. */
export function anonymousNetworkKey(ip: string): string {
  const mapped = ip.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped?.[1]) return mapped[1]
  if (isIP(ip) !== 6) return ip
  const [head = "", tail = ""] = ip.toLowerCase().split("::")
  const left = head ? head.split(":") : []
  const right = ip.includes("::") && tail ? tail.split(":") : []
  const groups = ip.includes("::")
    ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right]
    : left
  return `${groups.slice(0, 4).map((group) => group.replace(/^0+(?=.)/, "")).join(":")}::/64`
}

/**
 * Server-derived anonymous identity. Client-supplied fingerprints and the
 * user-agent are ignored so visitors cannot mint unlimited votes by rotating
 * headers: one anonymous identity per IPv4 address or IPv6 /64. NEXT-DOS-001.
 */
export function getRequestFingerprint(req: Request, _provided?: string): string {
  const network = anonymousNetworkKey(getClientIp(req))
  return createHash("sha256").update(network ? `anon|${network}` : "unknown").digest("hex")
}

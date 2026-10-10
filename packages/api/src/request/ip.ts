import { trustedIpHeaders } from "@featul/auth/ip"
import { isIP } from "node:net"

/** Use only ingress-owned headers; ignore invalid or attacker-chosen values. */
export function getClientIp(req: Request): string {
  for (const header of trustedIpHeaders()) {
    const hops = (req.headers.get(header) || "").split(",").map(value => value.trim()).filter(Boolean)
    const address = hops.at(-1) || ""
    if (isIP(address)) return address
  }
  return ""
}

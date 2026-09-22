/** Prefer proxy-set client IPs. Do not trust the first X-Forwarded-For hop. */
export function getClientIp(req: Request): string {
  const cf = String(req.headers.get("cf-connecting-ip") || "").trim()
  if (cf) return cf

  const real = String(req.headers.get("x-real-ip") || "").trim()
  if (real) return real

  const fly = String(req.headers.get("fly-client-ip") || "").trim()
  if (fly) return fly

  const xff = String(req.headers.get("x-forwarded-for") || "")
  const hops = xff
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  return hops[hops.length - 1] || ""
}

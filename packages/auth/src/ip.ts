type Environment = Record<string, string | undefined>

/** Only trust the header overwritten by the deployment's ingress. */
export function trustedIpHeaders(env: Environment = process.env): string[] {
  // Vercel overwrites these headers; arbitrary cf/fly headers remain client input.
  if (env.VERCEL === "1") return ["x-vercel-forwarded-for", "x-forwarded-for"]
  const configured = env.TRUSTED_PROXY_IP_HEADER?.trim().toLowerCase()
  if (configured && ["x-forwarded-for", "x-real-ip", "cf-connecting-ip", "fly-client-ip"].includes(configured)) return [configured]
  return env.NODE_ENV === "production" ? [] : ["x-forwarded-for", "x-real-ip"]
}

type Environment = Record<string, string | undefined>

/** Return variable names only; credentials must never be included in errors. */
export function productionConfigurationErrors(env: Environment): string[] {
  const required = ["DATABASE_URL", "BETTER_AUTH_SECRET", "NEXT_PUBLIC_APP_URL", "RESEND_API_KEY", "CRON_SECRET",
    "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_ID_STARTER_MONTHLY", "STRIPE_PRICE_ID_STARTER_YEARLY",
    "STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY", "STRIPE_PRICE_ID_PROFESSIONAL_YEARLY",
    "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"]
  const errors = required.filter(key => !env[key]?.trim()).map(key => `${key} is required`)
  for (const key of ["NEXT_PUBLIC_APP_URL", "R2_PUBLIC_BASE_URL", "UPSTASH_REDIS_REST_URL"]) {
    if (!env[key]) continue
    try {
      const url = new URL(env[key]!)
      if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) || url.hostname.endsWith(".localhost")) errors.push(`${key} must use a public HTTPS URL`)
    } catch { errors.push(`${key} must be a valid URL`) }
  }
  for (const key of ["BETTER_AUTH_SECRET", "CRON_SECRET"]) {
    if (env[key] && env[key]!.length < 32) errors.push(`${key} must be at least 32 characters`)
  }
  if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.startsWith("sk_live_") && !env.STRIPE_SECRET_KEY.startsWith("rk_live_")) errors.push("STRIPE_SECRET_KEY must be a live-mode key")
  if (env.STRIPE_WEBHOOK_SECRET && !env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")) errors.push("STRIPE_WEBHOOK_SECRET must be a webhook signing secret")
  for (const key of required.filter(key => key.startsWith("STRIPE_PRICE_ID_"))) {
    if (env[key] && !env[key]!.startsWith("price_")) errors.push(`${key} must be a Stripe price ID`)
  }
  for (const key of ["RATE_LIMIT_ENABLED", "API_RATE_LIMIT_ENABLED", "AUTH_RATE_LIMIT_ENABLED"]) {
    if (["0", "false", "off", "no"].includes(env[key]?.trim().toLowerCase() || "")) errors.push(`${key} must not disable production rate limiting`)
  }
  return errors
}

export function assertProductionConfiguration(env: Environment = process.env) {
  const errors = productionConfigurationErrors(env)
  if (errors.length) throw new Error(`Invalid production configuration: ${errors.join("; ")}`)
}

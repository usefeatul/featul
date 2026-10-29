import { trustedIpHeaders } from "./ip"
import { isSelfHosted, readEnv } from "./selfhost"
import { upstashCredentials } from "./upstash"

type Environment = Record<string, string | undefined>

const cloudOnlyRequired = ["RESEND_API_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_ID_STARTER_MONTHLY", "STRIPE_PRICE_ID_STARTER_YEARLY",
  "STRIPE_PRICE_ID_PROFESSIONAL_MONTHLY", "STRIPE_PRICE_ID_PROFESSIONAL_YEARLY",
  "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PRIVATE_BUCKET", "R2_PUBLIC_BASE_URL"]

/** Return variable names only; credentials must never be included in errors. */
export function productionConfigurationErrors(rawEnv: Environment): string[] {
  // Self-hosted installs have no billing, and email and uploads are optional; their URLs and
  // Redis credentials may come from FEATUL_DOMAIN and the Vercel Upstash integration.
  const selfHosted = isSelfHosted(rawEnv)
  const upstash = upstashCredentials(rawEnv)
  const env: Environment = {
    ...rawEnv,
    BETTER_AUTH_URL: readEnv("BETTER_AUTH_URL", rawEnv),
    NEXT_PUBLIC_APP_URL: readEnv("NEXT_PUBLIC_APP_URL", rawEnv),
    UPSTASH_REDIS_REST_URL: upstash.url,
    UPSTASH_REDIS_REST_TOKEN: upstash.token,
  }
  const required = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL", "CRON_SECRET",
    "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", ...(selfHosted ? [] : cloudOnlyRequired)]
  const errors = required.filter(key => !env[key]?.trim()).map(key => `${key} is required`)
  if (!trustedIpHeaders({ ...env, NODE_ENV: "production" }).length) errors.push("TRUSTED_PROXY_IP_HEADER is required outside Vercel")
  if (env.R2_PRIVATE_BUCKET && env.R2_PRIVATE_BUCKET === env.R2_BUCKET) errors.push("R2_PRIVATE_BUCKET must differ from the public bucket")
  // Docker self-hosts reach Redis over the private compose network.
  for (const key of ["BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL", "R2_PUBLIC_BASE_URL", ...(selfHosted ? [] : ["UPSTASH_REDIS_REST_URL"])]) {
    if (!env[key]) continue
    try {
      const url = new URL(env[key]!)
      if (url.protocol !== "https:" || ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) || url.hostname.endsWith(".localhost")) errors.push(`${key} must use a public HTTPS URL`)
    } catch { errors.push(`${key} must be a valid URL`) }
  }
  // The GitHub App signs its install state with a dedicated key, so check it once the app is set up.
  const githubAppConfigured = ["GITHUB_APP_ID", "GITHUB_APP_CLIENT_ID"].some(key => env[key]?.trim())
  if (githubAppConfigured && !env.GITHUB_SETUP_STATE_SECRET?.trim()) errors.push("GITHUB_SETUP_STATE_SECRET is required when the GitHub App is configured")
  if (githubAppConfigured && env.GITHUB_SETUP_STATE_SECRET && env.GITHUB_SETUP_STATE_SECRET === env.BETTER_AUTH_SECRET) errors.push("GITHUB_SETUP_STATE_SECRET must differ from BETTER_AUTH_SECRET")
  for (const key of ["BETTER_AUTH_SECRET", "CRON_SECRET", "GITHUB_SETUP_STATE_SECRET"]) {
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

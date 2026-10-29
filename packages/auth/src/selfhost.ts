type Environment = Record<string, string | undefined>

/**
 * Self-hosted installs (selfhost/install.sh, or the Deploy to Vercel button) set FEATUL_DOMAIN:
 * the app runs at https://FEATUL_DOMAIN and workspaces at https://{slug}.FEATUL_DOMAIN.
 */
export function selfHostedDomain(env: Environment = process.env): string {
  return String(env.FEATUL_DOMAIN ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
}

/** Self-hosted installs run without Stripe billing or a hosted email provider. */
export function isSelfHosted(env: Environment = process.env) {
  return Boolean(selfHostedDomain(env))
    || ["1", "true", "yes", "on"].includes(String(env.FEATUL_SELF_HOSTED ?? "").trim().toLowerCase())
}

/** Settings a self-hosted install derives from FEATUL_DOMAIN when they aren't set explicitly. */
function selfHostedDefault(name: string, env: Environment): string | undefined {
  const domain = selfHostedDomain(env)
  if (!domain) return undefined
  switch (name) {
    case "NEXT_PUBLIC_APP_URL":
    case "BETTER_AUTH_URL":
    case "PASSKEY_ORIGIN":
      return `https://${domain}`
    case "NEXT_PUBLIC_ROOT_DOMAIN":
    case "AUTH_COOKIE_DOMAIN":
    case "PASSKEY_RP_ID":
      return domain
    case "AUTH_TRUSTED_ORIGINS":
      return `https://${domain},https://*.${domain}`
    default:
      return undefined
  }
}

/** An environment variable, falling back to the value derived from FEATUL_DOMAIN when self-hosted. */
export function readEnv(name: string, env: Environment = process.env): string | undefined {
  return env[name]?.trim() || selfHostedDefault(name, env)
}

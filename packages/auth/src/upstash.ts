type Environment = Record<string, string | undefined>

/**
 * Upstash REST credentials. The Vercel Marketplace integration provisions them as KV_REST_API_*,
 * which the Upstash client also accepts; Featul Cloud and Docker installs use UPSTASH_REDIS_REST_*.
 */
export function upstashCredentials(env: Environment = process.env) {
  return {
    url: String(env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "").trim(),
    token: String(env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || "").trim(),
  }
}

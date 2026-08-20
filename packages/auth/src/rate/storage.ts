import type { BetterAuthRateLimitStorage } from "@better-auth/core"
import { Redis } from "@upstash/redis"

const upstashUrl = String(process.env.UPSTASH_REDIS_REST_URL || "").trim()
const upstashToken = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim()
const rateLimitPrefix = String(process.env.AUTH_RATE_LIMIT_PREFIX || "ba:rl:").trim()
const configuredTtl = Number.parseInt(String(process.env.AUTH_RATE_LIMIT_TTL_SECONDS || "600"), 10)
const ttlSeconds = Number.isFinite(configuredTtl) && configuredTtl > 0 ? configuredTtl : 600

const redis = upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null

function getStorageKey(key: string): string {
  return `${rateLimitPrefix}${key}`
}

export function getAuthRateLimitStorage(): BetterAuthRateLimitStorage | undefined {
  if (!redis) return undefined
  return {
    get: async (key) => {
      try {
        const value = await redis.get<{
          key?: unknown
          count?: unknown
          lastRequest?: unknown
        }>(getStorageKey(key))
        if (!value || typeof value !== "object") return null

        const count = Number(value.count)
        const lastRequest = Number(value.lastRequest)
        if (!Number.isFinite(count) || !Number.isFinite(lastRequest)) return null

        return {
          key: typeof value.key === "string" ? value.key : key,
          count,
          lastRequest,
        }
      } catch {
        return null
      }
    },
    set: async (key, value) => {
      try {
        await redis.set(getStorageKey(key), value, { ex: ttlSeconds })
      } catch {
        // Keep auth available if redis has a transient issue.
      }
    },
  }
}

import type { BetterAuthRateLimitStorage } from "@better-auth/core"
import { Redis } from "@upstash/redis"

export const CONSUME_AUTH_LIMIT = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2]) * 1000
local maximum = tonumber(ARGV[3])
local count = tonumber(redis.call('HGET', KEYS[1], 'count') or '0')
local last = tonumber(redis.call('HGET', KEYS[1], 'last') or '0')
if now - last >= window then count = 0 end
if count >= maximum then return math.max(1, math.ceil((window - (now - last)) / 1000)) end
redis.call('HSET', KEYS[1], 'count', count + 1, 'last', now)
redis.call('PEXPIRE', KEYS[1], window)
return 0`

export function getAuthRateLimitStorage(): BetterAuthRateLimitStorage | undefined {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return undefined
  const redis = new Redis({ url, token })
  const prefix = process.env.AUTH_RATE_LIMIT_PREFIX || "ba:rl:"
  return {
    async consume(key, rule) {
      try {
        // Version the key: the previous adapter stored a JSON string here.
        const retryAfter = Number(await redis.eval(CONSUME_AUTH_LIMIT, [`${prefix}v2:${key}`], [Date.now(), rule.window, rule.max]))
        return { allowed: retryAfter === 0, retryAfter: retryAfter || null }
      } catch {
        // An unavailable shared limiter must not silently bypass brute-force limits.
        return { allowed: false, retryAfter: 30 }
      }
    },
  }
}

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export type RateLimitResult = { success: boolean; remaining: number; reset: number; limit: number }

const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim()
const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim()

if (!url || !token) {
  throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN")
}

const redis = new Redis({ url, token })

const ratelimitPublic = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "60 s"), analytics: false, prefix: "rl:pub" })
const ratelimitPrivate = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(120, "60 s"), analytics: false, prefix: "rl:priv" })

function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || ""
  const cf = req.headers.get("cf-connecting-ip") || ""
  const fly = req.headers.get("fly-client-ip") || ""
  const real = req.headers.get("x-real-ip") || ""
  const first = String(xff.split(",")[0] || "").trim()
  return first || cf || fly || real || "unknown"
}

export async function limitPublic(req: Request): Promise<RateLimitResult> {
  return await ratelimitPublic.limit(getIp(req))
}

export async function limitPrivate(req: Request, userId: string): Promise<RateLimitResult> {
  const key = userId || getIp(req)
  return await ratelimitPrivate.limit(key)
}

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

const ratelimitInvite = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), analytics: false, prefix: "rl:invite" })

export async function limitInvite(userId: string): Promise<RateLimitResult> {
  return await ratelimitInvite.limit(userId)
}

const ratelimitStorageAvatar = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "60 s"), analytics: false, prefix: "rl:storage:avatar" })
const ratelimitStorageWorkspace = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "60 s"), analytics: false, prefix: "rl:storage:workspace" })
const ratelimitStoragePublicPostAnon = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "60 s"), analytics: false, prefix: "rl:storage:public-post:anon" })
const ratelimitStoragePublicPostUser = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(45, "60 s"), analytics: false, prefix: "rl:storage:public-post:user" })
const ratelimitStorageMemberPost = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "60 s"), analytics: false, prefix: "rl:storage:member-post" })
const ratelimitStorageComment = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "60 s"), analytics: false, prefix: "rl:storage:comment" })

export async function limitStorageAvatar(userId: string): Promise<RateLimitResult> {
  return await ratelimitStorageAvatar.limit(userId)
}

export async function limitStorageWorkspace(userId: string): Promise<RateLimitResult> {
  return await ratelimitStorageWorkspace.limit(userId)
}

export async function limitStoragePublicPostAnon(req: Request): Promise<RateLimitResult> {
  return await ratelimitStoragePublicPostAnon.limit(getIp(req))
}

export async function limitStoragePublicPostUser(userId: string): Promise<RateLimitResult> {
  return await ratelimitStoragePublicPostUser.limit(userId)
}

export async function limitStorageMemberPost(userId: string): Promise<RateLimitResult> {
  return await ratelimitStorageMemberPost.limit(userId)
}

export async function limitStorageComment(userId: string): Promise<RateLimitResult> {
  return await ratelimitStorageComment.limit(userId)
}

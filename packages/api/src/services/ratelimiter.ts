import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { HTTPException } from "hono/http-exception";

export type RateLimitResult = {
  enabled: boolean;
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
};

const TRUTHY_ENV_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSY_ENV_VALUES = new Set(["0", "false", "no", "off"]);

function readBooleanEnv(name: string): boolean | undefined {
  const rawValue = process.env[name];
  if (typeof rawValue !== "string") return undefined;

  const normalizedValue = rawValue.trim().toLowerCase();
  if (!normalizedValue) return undefined;
  if (TRUTHY_ENV_VALUES.has(normalizedValue)) return true;
  if (FALSY_ENV_VALUES.has(normalizedValue)) return false;

  return undefined;
}

function resolveRateLimitEnabled(...envNames: string[]): boolean {
  for (const envName of envNames) {
    const resolvedValue = readBooleanEnv(envName);
    if (typeof resolvedValue === "boolean") return resolvedValue;
  }

  return process.env.NODE_ENV === "production";
}

export const apiRateLimitEnabled = resolveRateLimitEnabled(
  "API_RATE_LIMIT_ENABLED",
  "RATE_LIMIT_ENABLED",
);

function createBypassRateLimitResult(): RateLimitResult {
  return {
    enabled: false,
    success: true,
    remaining: Number.MAX_SAFE_INTEGER,
    reset: Date.now(),
    limit: Number.MAX_SAFE_INTEGER,
  };
}

function withEnabledResult(
  result: Omit<RateLimitResult, "enabled">,
): RateLimitResult {
  return {
    enabled: true,
    ...result,
  };
}

export function applyRateLimitHeaders(
  c: any,
  result: RateLimitResult,
  errorMessage = "Too many requests. Please try again shortly.",
): void {
  if (!result.enabled) return;

  const resetInSeconds = Math.max(
    0,
    Math.ceil((result.reset - Date.now()) / 1000),
  );
  c.header("X-RateLimit-Limit", String(result.limit));
  c.header("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
  c.header("X-RateLimit-Reset", String(resetInSeconds));

  if (!result.success) {
    c.header("Retry-After", String(Math.max(1, resetInSeconds)));
    throw new HTTPException(429, { message: errorMessage });
  }
}

const url = String(process.env.UPSTASH_REDIS_REST_URL || "").trim();
const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

if (apiRateLimitEnabled && (!url || !token)) {
  throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN");
}

const redis = apiRateLimitEnabled ? new Redis({ url, token }) : null;

const ratelimitPublic = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: false,
      prefix: "rl:pub",
    })
  : null;
const ratelimitPrivate = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "60 s"),
      analytics: false,
      prefix: "rl:priv",
    })
  : null;

function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const cf = req.headers.get("cf-connecting-ip") || "";
  const fly = req.headers.get("fly-client-ip") || "";
  const real = req.headers.get("x-real-ip") || "";
  const first = String(xff.split(",")[0] || "").trim();
  return first || cf || fly || real || "unknown";
}

export async function limitPublic(req: Request): Promise<RateLimitResult> {
  if (!ratelimitPublic) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitPublic.limit(getIp(req)));
}

export async function limitPrivate(
  req: Request,
  userId: string,
): Promise<RateLimitResult> {
  if (!ratelimitPrivate) return createBypassRateLimitResult();
  const key = userId || getIp(req);
  return withEnabledResult(await ratelimitPrivate.limit(key));
}

const ratelimitInvite = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: false,
      prefix: "rl:invite",
    })
  : null;

export async function limitInvite(userId: string): Promise<RateLimitResult> {
  if (!ratelimitInvite) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitInvite.limit(userId));
}

const ratelimitStorageAvatar = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: false,
      prefix: "rl:storage:avatar",
    })
  : null;
const ratelimitStorageWorkspace = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: false,
      prefix: "rl:storage:workspace",
    })
  : null;
const ratelimitStoragePublicPostAnon = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: false,
      prefix: "rl:storage:public-post:anon",
    })
  : null;
const ratelimitStoragePublicPostUser = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(45, "60 s"),
      analytics: false,
      prefix: "rl:storage:public-post:user",
    })
  : null;
const ratelimitStorageComment = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: false,
      prefix: "rl:storage:comment",
    })
  : null;

export async function limitStorageAvatar(
  userId: string,
): Promise<RateLimitResult> {
  if (!ratelimitStorageAvatar) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitStorageAvatar.limit(userId));
}

export async function limitStorageWorkspace(
  userId: string,
): Promise<RateLimitResult> {
  if (!ratelimitStorageWorkspace) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitStorageWorkspace.limit(userId));
}

export async function limitStoragePublicPostAnon(
  req: Request,
): Promise<RateLimitResult> {
  if (!ratelimitStoragePublicPostAnon) return createBypassRateLimitResult();
  return withEnabledResult(
    await ratelimitStoragePublicPostAnon.limit(getIp(req)),
  );
}

export async function limitStoragePublicPostUser(
  userId: string,
): Promise<RateLimitResult> {
  if (!ratelimitStoragePublicPostUser) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitStoragePublicPostUser.limit(userId));
}

export async function limitStorageComment(
  userId: string,
): Promise<RateLimitResult> {
  if (!ratelimitStorageComment) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitStorageComment.limit(userId));
}

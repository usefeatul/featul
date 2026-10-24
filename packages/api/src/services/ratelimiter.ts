import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { HTTPException } from "hono/http-exception";
import { getClientIp } from "../request/ip";
import { getRequestFingerprint } from "../request/fingerprint";

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

// Upstash allows the request once this elapses, so keep it short and reject instead below.
const RATE_LIMIT_TIMEOUT_MS = 1000;

function withEnabledResult(
  result: Omit<RateLimitResult, "enabled"> & { reason?: string },
): RateLimitResult {
  return {
    enabled: true,
    ...result,
    // A slow or unreachable Redis must not lift the limits; errors already fail closed.
    success: result.success && result.reason !== "timeout",
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
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:pub",
    })
  : null;
const ratelimitPrivate = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:priv",
    })
  : null;

function getIp(req: Request): string {
  return getClientIp(req) || "unknown";
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
      timeout: RATE_LIMIT_TIMEOUT_MS,
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
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:storage:avatar",
    })
  : null;
const ratelimitStorageWorkspace = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:storage:workspace",
    })
  : null;
const ratelimitStoragePublicPostAnon = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:storage:public-post:anon",
    })
  : null;
const ratelimitStoragePublicPostUser = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(45, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:storage:public-post:user",
    })
  : null;
const ratelimitStorageComment = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:storage:comment",
    })
  : null;
const ratelimitStorageDeleteAnon = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:storage:delete:anon",
    })
  : null;
const ratelimitStorageDeleteUser = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:storage:delete:user",
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

export async function limitStorageDeleteAnon(
  req: Request,
): Promise<RateLimitResult> {
  if (!ratelimitStorageDeleteAnon) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitStorageDeleteAnon.limit(getIp(req)));
}

export async function limitStorageDeleteUser(
  userId: string,
): Promise<RateLimitResult> {
  if (!ratelimitStorageDeleteUser) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitStorageDeleteUser.limit(userId));
}

// Each voice transcription costs a model call.
const ratelimitCommentTranscribe = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:comment-transcribe",
    })
  : null;

export async function limitCommentTranscribe(
  userId: string,
): Promise<RateLimitResult> {
  if (!ratelimitCommentTranscribe) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitCommentTranscribe.limit(userId));
}

// Each Ask AI answer costs a model call, so visitors get far fewer than ordinary reads.
const ratelimitHelpAsk = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(6, "60 s"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:help-ask",
    })
  : null;

export async function limitHelpAsk(req: Request): Promise<RateLimitResult> {
  if (!ratelimitHelpAsk) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitHelpAsk.limit(getIp(req)));
}

// The monthly answer quota is shared by every visitor, so one visitor can't spend it all.
const ratelimitHelpAskDaily = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(30, "1 d"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:help-ask-day",
    })
  : null;

export async function limitHelpAskDaily(
  req: Request,
  workspaceId: string,
): Promise<RateLimitResult> {
  if (!ratelimitHelpAskDaily) return createBypassRateLimitResult();
  return withEnabledResult(
    await ratelimitHelpAskDaily.limit(`${workspaceId}:${getIp(req)}`),
  );
}

const ratelimitHelpSearchTrack = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 h"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:help-search-track",
    })
  : null;

/** Whether this view counts: each visitor's view of an article at most once a day. */
export async function claimHelpView(
  req: Request,
  articleId: string,
): Promise<boolean> {
  if (!redis) return true;
  try {
    const key = `help-view:${articleId}:${getRequestFingerprint(req)}`;
    return (await redis.set(key, 1, { nx: true, ex: 86_400 })) === "OK";
  } catch {
    return true;
  }
}

const SWAP_VOTE = `
local previous = redis.call('GET', KEYS[1])
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
return previous`;

/**
 * Stores a visitor's helpful vote on an article and returns the one it replaces, so repeat or
 * forged votes can't inflate the counts. Null when votes can't be tracked (no Redis).
 */
export async function swapHelpVote(
  req: Request,
  articleId: string,
  helpful: boolean,
): Promise<{ previous: boolean | undefined } | null> {
  if (!redis) return null;
  try {
    const key = `help-vote:${articleId}:${getRequestFingerprint(req)}`;
    const previous = await redis.eval(
      SWAP_VOTE,
      [key],
      [helpful ? "1" : "0", 90 * 86_400],
    );
    return {
      previous:
        previous === null || previous === undefined
          ? undefined
          : String(previous) === "1",
    };
  } catch {
    return null;
  }
}

/**
 * Whether a visitor's search should count toward analytics: each query once per visitor per day,
 * and a few dozen per hour at most, so one visitor can't flood top searches or content gaps.
 */
export async function claimHelpSearchTrack(
  req: Request,
  workspaceId: string,
  query: string,
): Promise<boolean> {
  if (!redis || !ratelimitHelpSearchTrack) return true;
  const visitor = `${workspaceId}:${getIp(req)}`;
  try {
    const fresh = await redis.set(`help-search-seen:${visitor}:${query}`, 1, {
      nx: true,
      ex: 86_400,
    });
    if (fresh !== "OK") return false;
    const result = await ratelimitHelpSearchTrack.limit(visitor);
    return result.success && result.reason !== "timeout";
  } catch {
    return true;
  }
}

// Each slug reservation sends an email, so one visitor can only request a handful per hour.
const ratelimitReservation = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: false,
      timeout: RATE_LIMIT_TIMEOUT_MS,
      prefix: "rl:reservation",
    })
  : null;

export async function limitReservation(req: Request): Promise<RateLimitResult> {
  if (!ratelimitReservation) return createBypassRateLimitResult();
  return withEnabledResult(await ratelimitReservation.limit(getIp(req)));
}

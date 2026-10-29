import { Redis } from "@upstash/redis";
import { upstashCredentials } from "@featul/auth/upstash";
import { HTTPException } from "hono/http-exception";
import { normalizePlan } from "../shared/plan";

export const AI_MONTHLY_REQUESTS = {
  free: 10,
  starter: 100,
  professional: 500,
} as const;
// Reserve before contacting the provider. Failed/aborted generations still consume
// their reservation because a provider may already have billed them.
export const RESERVE_AI = `
if redis.call('EXISTS', KEYS[3]) == 1 then return 1 end
if tonumber(redis.call('GET', KEYS[1]) or '0') >= tonumber(ARGV[1]) then return 2 end
if tonumber(redis.call('GET', KEYS[2]) or '0') >= 5 then return 3 end
redis.call('INCR', KEYS[1]); redis.call('EXPIRE', KEYS[1], ARGV[2])
redis.call('INCR', KEYS[2]); redis.call('EXPIRE', KEYS[2], 120)
redis.call('SET', KEYS[3], ARGV[3], 'EX', 180)
return 0`;
export const RELEASE_AI = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0`;

export async function reserveAiRequest(
  workspaceId: string,
  plan: string,
): Promise<() => Promise<void>> {
  const { url, token } = upstashCredentials();
  if (!url || !token)
    throw new HTTPException(503, {
      message: "AI usage tracking is unavailable",
    });
  const redis = new Redis({ url, token });
  const now = new Date();
  const month = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
  const expiry = Math.ceil(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - now.getTime()) /
      1000,
  );
  const prefix = `ai:{${workspaceId}}`;
  const lease = `${prefix}:running`;
  const id = crypto.randomUUID();
  let result: number;
  try {
    result = Number(
      await redis.eval(
        RESERVE_AI,
        [
          `${prefix}:month:${month}`,
          `${prefix}:minute:${Math.floor(now.getTime() / 60000)}`,
          lease,
        ],
        [AI_MONTHLY_REQUESTS[normalizePlan(plan)], expiry, id],
      ),
    );
  } catch {
    throw new HTTPException(503, {
      message: "AI usage tracking is unavailable",
    });
  }
  if (result !== 0)
    throw new HTTPException(429, {
      message:
        result === 2
          ? "Monthly AI allowance reached"
          : "Please wait before starting another AI request",
    });
  return async () => {
    try {
      await redis.eval(RELEASE_AI, [lease], [id]);
    } catch {
      /* The lease expires even if Redis becomes unavailable. */
    }
  };
}

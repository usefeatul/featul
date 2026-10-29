import { Redis } from "@upstash/redis";
import { upstashCredentials } from "@featul/auth/upstash";
import { HTTPException } from "hono/http-exception";
import { normalizePlan } from "../../shared/plan";

/** Voice clips each workspace may transcribe per calendar month (UTC). */
export const VOICE_MONTHLY_TRANSCRIPTIONS = {
  free: 100,
  starter: 1000,
  professional: 5000,
} as const;

// Counted before the provider call; refunded when the provider rejects the clip.
export const RESERVE_VOICE = `
local used = tonumber(redis.call('GET', KEYS[1]) or '0')
if used >= tonumber(ARGV[1]) then return -1 end
used = redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], ARGV[2])
return used`;
const REFUND_VOICE = `local used = tonumber(redis.call('GET', KEYS[1]) or '0') if used > 0 then redis.call('DECR', KEYS[1]) end return 0`;

function getRedis() {
  const { url, token } = upstashCredentials();
  return url && token ? new Redis({ url, token }) : null;
}

export function voiceMonthKey(workspaceId: string, now = new Date()) {
  return `voice:{${workspaceId}}:month:${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
}

/** Reserves one transcription from the workspace's monthly budget; returns a refund. */
export async function reserveVoiceTranscription(
  workspaceId: string,
  plan: string,
): Promise<() => Promise<void>> {
  const redis = getRedis();
  if (!redis)
    throw new HTTPException(503, { message: "Voice typing is unavailable right now" });
  const now = new Date();
  const key = voiceMonthKey(workspaceId, now);
  const expiry = Math.ceil(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - now.getTime()) / 1000,
  );
  let result: number;
  try {
    result = Number(
      await redis.eval(RESERVE_VOICE, [key], [
        VOICE_MONTHLY_TRANSCRIPTIONS[normalizePlan(plan)],
        expiry,
      ]),
    );
  } catch {
    throw new HTTPException(503, { message: "Voice typing is unavailable right now" });
  }
  if (result < 0)
    throw new HTTPException(429, {
      message: "Voice typing has reached its limit for this month",
    });
  return async () => {
    await redis.eval(REFUND_VOICE, [key], []).catch(() => {});
  };
}

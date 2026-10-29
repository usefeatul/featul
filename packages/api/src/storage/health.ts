import { Redis } from "@upstash/redis";
import { upstashCredentials } from "@featul/auth/upstash";
import { readEnv } from "@featul/auth/selfhost";

const DAY = 24 * 60 * 60 * 1000;

/** Keep local/preview runs from satisfying the production cleanup monitor. */
export function storageHealthKey(env: NodeJS.ProcessEnv = process.env): string {
  const appUrl = readEnv("BETTER_AUTH_URL", env);
  if (!appUrl) throw new Error("Storage health requires the app origin");
  return `jobs:${env.VERCEL_ENV || env.NODE_ENV || "development"}:${new URL(appUrl).origin}:storage-gc:completed`;
}

/** Daily 04:00 UTC cleanup has until 05:00 UTC to complete. */
export function requireRecentStorageCleanup(completedAt: unknown, now = Date.now()): void {
  const today = new Date(now);
  const scheduled = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 4);
  const required = now < scheduled + 60 * 60 * 1000 ? scheduled - DAY : scheduled;
  if (typeof completedAt !== "number" || !Number.isFinite(completedAt)
    || completedAt < required || completedAt > now + 60_000) {
    throw new Error("Storage cleanup has not completed within its daily grace period");
  }
}

function healthStore(): Redis {
  const { url, token } = upstashCredentials();
  if (!url || !token) throw new Error("Storage health tracking is unavailable");
  return new Redis({ url, token, retry: false, signal: () => AbortSignal.timeout(5000) });
}

export async function recordStorageCleanup(): Promise<void> {
  await healthStore().set(storageHealthKey(), Date.now(), { ex: 60 * 24 * 60 * 60 });
}

export async function checkStorageCleanup(): Promise<void> {
  const completedAt = await healthStore().get<number>(storageHealthKey());
  requireRecentStorageCleanup(completedAt);
}

import { db } from "@featul/db";
import { publishScheduledChangelogEntries } from "@featul/api/changelog/schedule";

const DEV_SCHEDULER_KEY = Symbol.for("featul.devScheduler");

/**
 * Vercel Cron only runs on deployments, so `next dev` would never publish scheduled changelog
 * entries. Locally we tick the same job every minute; the global flag keeps hot reloads from
 * starting a second timer. Node only: loaded from instrumentation's nodejs branch.
 */
export function startDevScheduler() {
  const store = globalThis as Record<symbol, unknown>;
  if (store[DEV_SCHEDULER_KEY]) return;
  store[DEV_SCHEDULER_KEY] = true;

  const tick = async () => {
    try {
      const result = await publishScheduledChangelogEntries(db);
      if (result.published) console.warn(`[dev scheduler] Published ${result.published} scheduled changelog entries`);
    } catch (error) {
      console.error("[dev scheduler] Scheduled changelog publish failed", error);
    }
  };

  void tick();
  setInterval(tick, 60_000);
}

import { db } from "@featul/db";
import { runStorageOrphanGc } from "@featul/api/storage/delete";
import { recordStorageCleanup } from "@featul/api/storage/health";
import * as Sentry from "@sentry/nextjs";
import { isAuthorizedCron } from "../authorize";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Deletes orphaned storage objects. Requires CRON_SECRET Bearer token. */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runStorageOrphanGc(db);
    if (result.skipped) throw new Error("Storage cleanup is not configured");
    // The five-minute monitor checks this heartbeat, including missed runs.
    // This keeps both jobs covered by Sentry's single included cron monitor.
    await recordStorageCleanup();
    return Response.json(result);
  } catch (error) {
    console.error("Storage orphan GC failed:", error);
    Sentry.captureException(error, { tags: { job: "storage-orphan-gc" } });
    return Response.json({ error: "Storage GC failed" }, { status: 500 });
  } finally {
    await Sentry.flush(2000);
  }
}

import { db } from "@featul/db";
import { runStorageOrphanGc } from "@featul/api/services/storage-delete";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorizedCron(request: Request): boolean {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runStorageOrphanGc(db);
    return Response.json(result);
  } catch (error) {
    console.error("Storage orphan GC failed:", error);
    return Response.json({ error: "Storage GC failed" }, { status: 500 });
  }
}

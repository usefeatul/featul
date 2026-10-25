import { NextResponse } from "next/server";
import { db } from "@featul/db";
import { verifyWebhookSignature } from "@featul/api/services/github-app";
import { handleInstallationDeleted, handleIssuesEvent, type StatusNotification } from "@featul/api/github/sync";
import { sendAfterResponse } from "@featul/api/github/defer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GitHub App webhook. Linked posts follow their issue's state; uninstalls drop the connection. */
export async function POST(req: Request) {
  const body = await req.text();
  if (!verifyWebhookSignature(body, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Parameters<typeof handleIssuesEvent>[1] & { installation?: { id?: number | string } };
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = req.headers.get("x-github-event");
  // GitHub gives up after 10 seconds, so voter emails go out after the response.
  const notifications: StatusNotification[] = [];
  try {
    if (event === "issues") {
      return NextResponse.json(await handleIssuesEvent(db, payload, (n) => notifications.push(n)));
    }
    if (event === "installation" && payload.action === "deleted" && payload.installation?.id) {
      return NextResponse.json(await handleInstallationDeleted(db, String(payload.installation.id)));
    }
    return NextResponse.json({ ignored: event });
  } catch (error) {
    console.error("[github-webhook] failed", error);
    // GitHub doesn't retry on its own; "Sync" in Settings → Integrations catches up.
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  } finally {
    sendAfterResponse(notifications);
  }
}

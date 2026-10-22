import { db } from "@featul/db"
import { publishScheduledChangelogEntries } from "@featul/api/changelog/schedule"
import * as Sentry from "@sentry/nextjs"

export const runtime = "nodejs"
export const maxDuration = 60

/** Publishes scheduled changelog entries that are due. Requires CRON_SECRET Bearer token. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const result = await publishScheduledChangelogEntries(db)
    if (result.failures) {
      Sentry.captureMessage(`Scheduled changelog: ${result.failures} failed to publish`, "error")
    }
    return Response.json(result)
  } catch (error) {
    console.error("[changelog] Scheduled publish failed", error)
    Sentry.captureException(error, { tags: { job: "changelog-schedule" } })
    return Response.json({ error: "Scheduled publish failed" }, { status: 500 })
  } finally {
    await Sentry.flush(2000)
  }
}

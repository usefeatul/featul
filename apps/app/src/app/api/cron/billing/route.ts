import { reconcileBilling } from "@featul/auth/billing/reconcile"
import * as Sentry from "@sentry/nextjs"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const result = await Sentry.withMonitor("billing-reconciliation", async () => {
      const result = await reconcileBilling()
      if (result.failures || result.overdueEvents) {
        throw new Error(`Billing reconciliation: ${result.failures} failures, ${result.overdueEvents} overdue events`)
      }
      return result
    }, { schedule: { type: "crontab", value: "*/5 * * * *" }, checkinMargin: 5, maxRuntime: 2, timezone: "UTC" })
    return Response.json(result)
  } catch (error) {
    console.error("[billing] Reconciliation failed", error)
    Sentry.captureException(error, { tags: { job: "billing-reconciliation" } })
    await Sentry.flush(2000)
    return Response.json({ error: "Billing reconciliation failed" }, { status: 500 })
  }
}

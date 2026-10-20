import { reconcileBilling } from "@featul/auth/billing/reconcile"
import { checkStorageCleanup } from "@featul/api/storage/health"
import { reconcileWebhooks } from "@featul/api/services/delivery"
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
      const [billing, deliveries] = await Promise.allSettled([reconcileBilling(), reconcileWebhooks()])
      if (billing.status === "rejected") throw billing.reason
      if (deliveries.status === "rejected") throw deliveries.reason
      const result = { ...billing.value, notifications: deliveries.value }
      // Reconcile first so a cleanup outage never prevents billing retries.
      await checkStorageCleanup()
      if (result.failures || result.overdueEvents) {
        throw new Error(`Billing reconciliation: ${result.failures} failures, ${result.overdueEvents} overdue events`)
      }
      if (result.notifications.failures || result.notifications.overdue) {
        throw new Error(`Webhook delivery: ${result.notifications.failures} failures, ${result.notifications.overdue} overdue`)
      }
      return result
    }, { schedule: { type: "crontab", value: "*/5 * * * *" }, checkinMargin: 5, maxRuntime: 2, timezone: "UTC" })
    return Response.json(result)
  } catch (error) {
    console.error("[billing] Reconciliation failed", error)
    Sentry.captureException(error, { tags: { job: "billing-reconciliation" } })
    return Response.json({ error: "Billing reconciliation failed" }, { status: 500 })
  } finally {
    // Serverless execution may freeze after the response. Deliver the final
    // successful check-in too, otherwise Sentry reports a false timeout.
    await Sentry.flush(2000)
  }
}

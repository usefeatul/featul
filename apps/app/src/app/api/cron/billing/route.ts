import { reconcileBilling } from "@featul/auth/billing/reconcile"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const result = await reconcileBilling()
    return Response.json(result, { status: result.failures ? 500 : 200 })
  } catch (error) {
    console.error("[billing] Reconciliation failed", error)
    return Response.json({ error: "Billing reconciliation failed" }, { status: 500 })
  }
}

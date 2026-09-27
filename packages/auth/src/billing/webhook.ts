import { getStripeClient } from "../stripe"
import { receiveBillingEvent } from "./events"

// This explicit route owns the existing webhook URL, bypassing Better Auth's
// lifecycle handlers, which acknowledge some failed callbacks in version 1.5.5.
export async function handleStripeWebhook(request: Request) {
  const stripe = getStripeClient()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return Response.json({ error: "Billing unavailable" }, { status: 503 })
  const signature = request.headers.get("stripe-signature")
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 })
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret)
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }
  try {
    await receiveBillingEvent(event)
    return Response.json({ received: true })
  } catch (error) {
    console.error("[billing] Webhook processing failed", { eventId: event.id, error })
    return Response.json({ error: "Billing update failed" }, { status: 500 })
  }
}

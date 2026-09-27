import { auth } from "../auth"
import { getStripeClient } from "../stripe"
import { isWorkspaceBillingOwner } from "../billing"
import { BillingBusyError, withBillingLock } from "./lock"
import { BillingConflictError, prepareWorkspaceCheckout } from "./mutations"
import { getBillingContext, syncWorkspaceBilling } from "./sync"
import { stripeId } from "./policy"

export async function handleBillingUpgrade(request: Request, next: (request: Request) => Promise<Response>) {
  // The wrapper performs Stripe mutations before Better Auth runs its own CSRF checks.
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ message: "Invalid billing request origin" }, { status: 403 })
  }
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ message: "Unauthorized" }, { status: 401 })
  let body: Record<string, unknown>
  try {
    body = await request.clone().json()
    if (!body || Array.isArray(body) || typeof body !== "object") throw new Error("Invalid body")
  } catch {
    return Response.json({ message: "Invalid billing request" }, { status: 400 })
  }
  if (body.plan !== "starter" && body.plan !== "professional") {
    return Response.json({ message: "Invalid billing plan" }, { status: 400 })
  }
  const workspaceId = typeof body.referenceId === "string" ? body.referenceId : ""
  if (!workspaceId || !await isWorkspaceBillingOwner(workspaceId, session.user.id)) {
    return Response.json({ message: "Only the workspace owner can manage billing" }, { status: 403 })
  }
  if (body.customerType && body.customerType !== "user") {
    return Response.json({ message: "Workspace billing uses user customers" }, { status: 400 })
  }
  try {
    return await withBillingLock(workspaceId, async (lease) => {
      const subscriptionId = await prepareWorkspaceCheckout(lease)
      const headers = new Headers(request.headers)
      headers.delete("content-length")
      headers.set("content-type", "application/json")
      // Resolve the ID on the server so stale UI state cannot start a second subscription.
      return next(new Request(request.url, {
        method: "POST", headers,
        body: JSON.stringify({ ...body, subscriptionId, customerType: "user" }),
      }))
    })
  } catch (error) {
    if (error instanceof BillingConflictError || error instanceof BillingBusyError) {
      return Response.json({ message: error.message }, { status: 409 })
    }
    console.error("[billing] Checkout preparation failed", error)
    return Response.json({ message: "Could not verify your billing. Please try again." }, { status: 503 })
  }
}

export async function handleBillingReturn(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return Response.json({ message: "Sign in to finish updating your billing, then reload this page." }, { status: 401 })
  const url = new URL(request.url)
  const checkoutId = url.searchParams.get("session_id") || url.searchParams.get("checkoutSessionId")
  const stripe = getStripeClient()
  if (!stripe) return Response.json({ message: "Billing is unavailable" }, { status: 503 })
  try {
    const checkout = checkoutId ? await stripe.checkout.sessions.retrieve(checkoutId) : null
    const workspaceId = url.searchParams.get("workspaceId") || checkout?.client_reference_id || checkout?.metadata?.referenceId || ""
    if (!workspaceId || !await isWorkspaceBillingOwner(workspaceId, session.user.id)) {
      return Response.json({ message: "Only the workspace owner can manage billing" }, { status: 403 })
    }
    const context = await getBillingContext(workspaceId)
    if (checkout && (checkout.mode !== "subscription" || checkout.status !== "complete"
      || (checkout.client_reference_id || checkout.metadata?.referenceId) !== workspaceId
      || !context.customerIds.has(stripeId(checkout.customer)))) {
      return Response.json({ message: "Checkout does not match this workspace" }, { status: 400 })
    }
    const billing = await syncWorkspaceBilling(workspaceId)
    if (checkout && !billing.subscriptions.some((row) => row.stripeSubscriptionId === stripeId(checkout.subscription))) {
      throw new Error("Checkout subscription has not synchronized yet")
    }
    // Never trust a caller-supplied callbackURL; derive the destination from the workspace.
    return new Response(null, {
      status: 303,
      headers: { Location: new URL(`/workspaces/${context.owner.slug}/settings/billing`, url.origin).toString(), "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error("[billing] Return synchronization failed", error)
    return Response.json({ message: "Your billing update is still processing. Reload this page to try again." }, {
      status: 503, headers: { "Retry-After": "5", "Cache-Control": "no-store" },
    })
  }
}

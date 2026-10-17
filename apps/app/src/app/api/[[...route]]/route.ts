import { app } from "@featul/api/elysia";
import { withCors, handlePreflight } from "@featul/auth/trust";
import { after } from "next/server";
import { reconcileWebhooks } from "@featul/api/services/delivery";
import * as Sentry from "@sentry/nextjs";

/** Forwards all `/api/*` traffic to the jstack/Elysia app with CORS. */
const handler = (req: Request) => app.handle(req);

export const OPTIONS = handlePreflight;
export const GET = async (req: Request) => withCors(req, await handler(req));
export const POST = async (req: Request) => {
  const response = await handler(req);
  if (response.ok && /^\/api\/(post|widget)\/create\/?$/.test(new URL(req.url).pathname)) {
    // The transaction already saved the intent. Cron retries if this invocation ends early.
    after(async () => {
      try { await reconcileWebhooks(); }
      catch (error) { Sentry.captureException(error, { tags: { job: "webhook-delivery" } }); }
    });
  }
  return withCors(req, response);
};

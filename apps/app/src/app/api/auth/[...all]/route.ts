import { auth } from "@featul/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { handlePreflight, withCors } from "@featul/auth/trust";
import { handleBillingUpgrade } from "@featul/auth/billing/http";

/** Better-auth catch-all for `/api/auth/*`, with CORS on GET/POST. */
const handler = toNextJsHandler(auth);
export const runtime = "nodejs";
export const maxDuration = 60;

export const OPTIONS = handlePreflight;

export const GET = async (req: Request) =>
  withCors(req, await handler.GET(req));
export const POST = async (req: Request) => {
  const isUpgrade = new URL(req.url).pathname.replace(/\/$/, "") === "/api/auth/subscription/upgrade";
  return withCors(req, await (isUpgrade ? handleBillingUpgrade(req, handler.POST) : handler.POST(req)));
};

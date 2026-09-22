import { auth } from "@featul/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { handlePreflight, withCors } from "@featul/auth/trust";

/** Better-auth catch-all for `/api/auth/*`, with CORS on GET/POST. */
const handler = toNextJsHandler(auth);

export const OPTIONS = handlePreflight;

export const GET = async (req: Request) =>
  withCors(req, await handler.GET(req));
export const POST = async (req: Request) =>
  withCors(req, await handler.POST(req));

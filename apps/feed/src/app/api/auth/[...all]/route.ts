import { auth } from "@oreilla/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { handlePreflight, withCors } from "@oreilla/auth/trust";
const handler = toNextJsHandler(auth);

export const OPTIONS = handlePreflight;

export const GET = async (req: Request) =>
  withCors(req, await handler.GET(req));
export const POST = async (req: Request) =>
  withCors(req, await handler.POST(req));

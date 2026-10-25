import { j, publicProcedure } from "../../jstack";
import { foreignRequestOrigin } from "./origins";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readRequest(c: unknown): Request | null {
  if (!isRecord(c)) return null;
  const req = c.req;
  if (isRecord(req) && req.raw instanceof Request) return req.raw;
  if (c.request instanceof Request) return c.request;
  return null;
}

const widgetOriginMiddleware = j.middleware(async ({ next, c }) => {
  return await next({ widgetOrigin: foreignRequestOrigin(readRequest(c)) });
});

/** Public widget procedure that records the caller's browser Origin. */
export const widgetProcedure = publicProcedure.use(widgetOriginMiddleware);

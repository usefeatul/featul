import { jstack } from "jstack";
import { auth } from "@featul/auth/auth";
import { HTTPException } from "hono/http-exception";
import { headers } from "next/headers";
import { db } from "@featul/db";
import { enforceTrustedBrowserOrigin } from "./shared/request-origin";
import {
  applyRateLimitHeaders,
  limitPublic,
  limitPrivate,
} from "./services/ratelimiter";

export const j = jstack.init();

const databaseMiddleware = j.middleware(async ({ next }) => {
  return await next({ db: db as any });
});

const authMiddleware = j.middleware(async ({ next, c }) => {
  const req: Request = (c as any)?.req?.raw || (c as any)?.request;
  const session = await auth.api.getSession({
    headers: req?.headers || (await headers()),
  });
  if (!session || !session.user) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  enforceTrustedBrowserOrigin(req);
  return await next({ session });
});

function createRateLimitMiddleware(
  limitFn: (
    req: Request,
    c: any,
  ) => Promise<{
    enabled: boolean;
    success: boolean;
    remaining: number;
    reset: number;
    limit: number;
  }>,
) {
  return j.middleware(async ({ next, c }) => {
    const method = String(
      (c as any)?.req?.raw?.method || (c as any)?.request?.method || "",
    ).toUpperCase();
    if (method === "OPTIONS") return await next();

    const req: Request = (c as any)?.req?.raw || (c as any)?.request;
    const result = await limitFn(req, c);
    applyRateLimitHeaders(c, result, "Too Many Requests");

    return await next();
  });
}

const rateLimitMiddlewarePublic = createRateLimitMiddleware(async (req) => {
  return await limitPublic(req);
});

const rateLimitMiddlewarePrivate = createRateLimitMiddleware(async (req, c) => {
  const userId = String((c as any)?.ctx?.session?.user?.id || "");
  return await limitPrivate(req, userId);
});

const baseProcedure = j.procedure.use(databaseMiddleware);
const authenticatedProcedure = baseProcedure.use(authMiddleware);

export const publicProcedure = baseProcedure.use(rateLimitMiddlewarePublic);
export const privateProcedure = authenticatedProcedure.use(
  rateLimitMiddlewarePrivate,
);

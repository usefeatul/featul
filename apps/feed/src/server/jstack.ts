import { jstack } from "jstack";
import { db } from "@feedgot/db";
import { headers } from "next/headers";
import { auth as betterAuthServer } from "../lib/auth/auth";

export const j = jstack.init();

// Database middleware that adds db to context
const databaseMiddleware = j.middleware(async ({next }) => {
  return await next({ db });
});

// Auth middleware that adds session to context  
const authMiddleware = j.middleware(async ({ next }) => {
  const session = await betterAuthServer.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return await next({ session });
});

// Public procedure with database access - using any to avoid complex type inference issues
export const publicProcedure: typeof j.procedure = j.procedure.use(databaseMiddleware);
export const privateProcedure: typeof j.procedure = j.procedure.use(databaseMiddleware).use(authMiddleware);


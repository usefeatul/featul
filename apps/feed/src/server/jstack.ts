import { jstack } from "jstack";
import { db } from "@feedgot/db";
import { headers } from "next/headers";
import { auth as betterAuthServer } from "../lib/auth/auth";

export const j = jstack.init();
const databaseMiddleware = j.middleware(async ({ next }) => {
  return await next({ db });
});

export const publicProcedure = j.procedure.use(
  databaseMiddleware
) as ReturnType<typeof j.procedure.use>;

const authMiddleware = j.middleware(async ({ next }) => {
  const session = await betterAuthServer.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  return await next({ session });
});

export const privateProcedure = publicProcedure.use(
  authMiddleware
) as ReturnType<typeof j.procedure.use>;

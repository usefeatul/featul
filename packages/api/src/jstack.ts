import { jstack } from "jstack"
import { auth } from "@feedgot/auth/auth"
import { headers } from "next/headers"

import { db } from "@feedgot/db"


export const j = jstack.init()

const databaseMiddleware = j.middleware(async ({ next }) => {
  return await next({ db: db as any })
})

const authMiddleware = j.middleware(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }
  return await next({ session: session as any })
})

export const publicProcedure = j.procedure.use(databaseMiddleware)
export const privateProcedure = publicProcedure.use(authMiddleware)

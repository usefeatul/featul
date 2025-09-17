import { jstack } from "jstack"
import { db } from "@feedgot/db"

export const j = jstack.init()

/**
 * Database middleware that provides the external db instance
 * 
 * @see https://jstack.app/docs/backend/middleware
 */
const databaseMiddleware = j.middleware(async ({ next }) => {
  return await next({ db })
})

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const publicProcedure = j.procedure.use(databaseMiddleware) as ReturnType<typeof j.procedure.use>

import { jstack } from "jstack"
import { auth } from "@featul/auth/auth"
import { HTTPException } from "hono/http-exception"
import { headers } from "next/headers"
import { db } from "@featul/db"
import { enforceTrustedBrowserOrigin } from "./shared/request-origin"
// import { limitPublic, limitPrivate } from "./services/ratelimiter"


export const j = jstack.init()

const databaseMiddleware = j.middleware(async ({ next }) => {
  return await next({ db: db as any })
})

const authMiddleware = j.middleware(async ({ next, c }) => {
  const req: Request = (c as any)?.req?.raw || (c as any)?.request
  const session = await auth.api.getSession({ headers: req?.headers || (await headers()) })
  if (!session || !session.user) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }
  enforceTrustedBrowserOrigin(req)
  return await next({ session })
})

// Temporarily disable rate limiting middleware; keep for future re-enable.
// function createRateLimitMiddleware(
//   limitFn: (req: Request, c: any) => Promise<{ success: boolean; remaining: number; reset: number; limit: number }>
// ) {
//   return j.middleware(async ({ next, c }) => {
//     const method = String(((c as any)?.req?.raw?.method || (c as any)?.request?.method || "")).toUpperCase()
//     if (method === "OPTIONS") return await next()
//     const req: Request = (c as any)?.req?.raw || (c as any)?.request
//     const res = await limitFn(req, c)
//     if (!res.success) {
//       const retry = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000))
//       c.header("Retry-After", String(retry))
//       throw new HTTPException(429, { message: "Too Many Requests" })
//     }
//     c.header("X-RateLimit-Limit", String(res.limit))
//     c.header("X-RateLimit-Remaining", String(res.remaining))
//     c.header("X-RateLimit-Reset", String(Math.max(0, Math.ceil((res.reset - Date.now()) / 1000))))
//     return await next()
//   })
// }

// const rateLimitMiddlewarePublic = createRateLimitMiddleware(async (req) => {
//   return await limitPublic(req)
// })

// const rateLimitMiddlewarePrivate = createRateLimitMiddleware(async (req, c) => {
//   const userId = String(((c as any)?.ctx?.session?.user?.id) || "")
//   return await limitPrivate(req, userId)
// })

const baseProcedure = j.procedure.use(databaseMiddleware)
export const publicProcedure = baseProcedure
export const privateProcedure = baseProcedure.use(authMiddleware)

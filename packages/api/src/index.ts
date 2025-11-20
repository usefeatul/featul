import { jstack } from "jstack"
import { createWorkspaceRouter } from "./router/workspace"

export function createAppRouter(opts: { db: any; auth: any; getHeaders: () => any }) {
  const j = jstack.init()

  const databaseMiddleware = j.middleware(async ({ next }) => {
    return await next({ db: opts.db })
  })

  const authMiddleware = j.middleware(async ({ next }) => {
    const session = await opts.auth.api.getSession({
      headers: await opts.getHeaders(),
    })

    if (!session || !session.user) {
      throw new Error("Unauthorized")
    }

    return await next({ session })
  })

  const publicProcedure = j.procedure.use(databaseMiddleware)
  const privateProcedure = j.procedure.use(databaseMiddleware).use(authMiddleware)

  const api = j
    .router()
    .basePath("/api")
    .use(j.defaults.cors)
    .onError(j.defaults.errorHandler)

  const workspaceRouter = createWorkspaceRouter(j, privateProcedure, publicProcedure)

  const appRouter = j.mergeRouters(api, {
    workspace: workspaceRouter,
  })

  return appRouter
}

export type AppRouter = ReturnType<typeof createAppRouter>
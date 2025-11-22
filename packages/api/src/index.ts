import { j } from "./jstack"

const api = j
  .router()
  .basePath("/api")
  .use(j.defaults.cors)
  .onError(j.defaults.errorHandler)

const routerImports = {
  workspace: () => import("./router/workspace").then((m) => m.createWorkspaceRouter()),
  board: () => import("./router/board").then((m) => m.createBoardRouter()),
}

const appRouter = j.mergeRouters(api, {
  workspace: routerImports.workspace,
  board: routerImports.board,
})

export type AppRouter = typeof appRouter
export default appRouter

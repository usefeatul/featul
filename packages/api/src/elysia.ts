import { Elysia } from "elysia"
import appRouter from "./index"

export const app = new Elysia({ prefix: "/api" })
  .get("/elysia-health", (c) => new Response("Elysia is working!", { status: 200 }))
  .mount("/", appRouter.handler.fetch.bind(appRouter.handler))

export type App = typeof app

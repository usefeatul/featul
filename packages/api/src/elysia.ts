import { Elysia } from "elysia";
import appRouter from "./index";

export const app = new Elysia({ prefix: "/api" }).mount(
  "/",
  appRouter.handler.fetch.bind(appRouter.handler)
);
export type App = typeof app;

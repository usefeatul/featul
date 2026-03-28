import { defineConfig } from "drizzle-kit"
import { config as loadEnv } from "dotenv"
import path from "node:path"

// Prefer the app env so local schema changes target the same database the app
// is running against. A shell-provided DATABASE_URL still wins over both files.
loadEnv({
  path: path.resolve(process.cwd(), "../../apps/app/.env"),
})
loadEnv()

export default defineConfig({
  out: "./drizzle",
  schema: "./schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})

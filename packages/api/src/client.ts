import { createClient } from "jstack"
import type { AppRouter } from "./index"

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl) return envUrl
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:3000`
}

export const client = createClient<AppRouter>({
  baseUrl: `${getBaseUrl()}/api`,
  credentials: "include",
})

export type { AppRouter }

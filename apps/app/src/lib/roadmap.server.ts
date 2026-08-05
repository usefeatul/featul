import { headers } from "next/headers"
import { ROADMAP_DEFAULT_COLLAPSED, ROADMAP_STATUSES } from "./roadmap"

export async function readInitialCollapsedByStatus(slug: string): Promise<Record<string, boolean>> {
  const key = `rdmpc:${slug}`
  const cookieHeader = (await headers()).get("cookie") || ""
  const match = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${key}=`))
  const encoded = match ? decodeURIComponent(match.split("=")[1] || "") : ""
  const initial: Record<string, boolean> = {}
  for (let i = 0; i < ROADMAP_STATUSES.length; i++) {
    const s = ROADMAP_STATUSES[i] as string
    if (encoded.charAt(i) === "1" || encoded.charAt(i) === "0") {
      initial[s] = encoded.charAt(i) === "1"
      continue
    }
    initial[s] = !!ROADMAP_DEFAULT_COLLAPSED[s as keyof typeof ROADMAP_DEFAULT_COLLAPSED]
  }
  return initial
}

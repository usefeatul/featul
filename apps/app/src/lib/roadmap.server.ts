/** Hydrates roadmap column collapse from cookies. */
import { headers } from "next/headers"
import { ROADMAP_STATUSES } from "./roadmap"

/** Decodes the per-workspace collapse bitstring cookie. */
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
    initial[s] = encoded.charAt(i) === "1"
  }
  return initial
}

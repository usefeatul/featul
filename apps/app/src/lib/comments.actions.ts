"use server"

import { cookies } from "next/headers"

/** Persists collapsed comment ids in an httpOnly cookie. */
export async function updateCommentCollapseState(
  postId: string,
  commentId: string,
  isCollapsed: boolean
) {
  const cookieStore = await cookies()
  const key = `cmc${postId}`
  // Get existing cookie
  const existing = cookieStore.get(key)?.value || ""
  // Decode and parse CSV
  const ids = new Set(existing ? decodeURIComponent(existing).split(",").filter(Boolean) : [])
  // Update state
  if (isCollapsed) {
    ids.add(commentId)
  } else {
    ids.delete(commentId)
  }
  // Create new value (CSV)
  const newValue = Array.from(ids).join(",")
  // Set cookie with security flags
  cookieStore.set(key, newValue, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  })
}

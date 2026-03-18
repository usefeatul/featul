import { cookies } from "next/headers"

export async function readInitialCollapsedCommentIds(postId: string): Promise<string[]> {
  const cookieStore = await cookies()
  const key = `cmc${postId}`
  const cookie = cookieStore.get(key)
  
  if (!cookie?.value) return []
  
  try {
    return decodeURIComponent(cookie.value).split(",").filter(Boolean)
  } catch {
    return []
  }
}

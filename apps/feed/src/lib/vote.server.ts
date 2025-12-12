import { db, vote } from "@oreilla/db"
import { eq, and } from "drizzle-orm"
import { getServerSession } from "@oreilla/auth"

export async function readHasVotedForPost(postId: string): Promise<boolean> {
  const session = await getServerSession()
  const userId = String((session as any)?.user?.id || "")
  if (!userId) return false
  const [v] = await db
    .select({ id: vote.id })
    .from(vote)
    .where(and(eq(vote.postId, postId), eq(vote.userId, userId)))
    .limit(1)
  return Boolean(v?.id)
}

import "server-only";
import { db } from "@featul/db";
import { getServerSession } from "@featul/auth/session";
import { listPostActivity } from "@featul/api/post/activity";
import type { CommentSurface } from "@/lib/comment/shared";
import type { InitialActivity } from "@/types/activity";

/** Read the authorized first page with the request, then let the client refresh it. */
export async function loadInitialActivity(
  postId: string,
  surface: CommentSurface,
): Promise<InitialActivity | undefined> {
  try {
    const session = await getServerSession();
    const userId = session?.user?.id ?? null;
    const page = await listPostActivity(
      db,
      { postId, surface, offset: 0 },
      userId,
    );
    return { page, userId, updatedAt: Date.now() };
  } catch {
    // A transient activity failure must not block the post; the client retries.
    return undefined;
  }
}

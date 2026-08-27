"use client";

import type { QueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import type { PostDeletedEventDetail } from "@/types/events";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";

type DeletePostErrorResponse = {
  message?: string;
};

export type DeletePostResult = { ok: true } | { ok: false; message: string };

/** Deletes a post and captures analytics; never throws. */
export async function deletePostById(
  postId: string,
): Promise<DeletePostResult> {
  try {
    const response = await client.post.delete.$post({ postId });
    if (response.ok) {
      captureAnalyticsEvent(analyticsEvents.postDeleted, {
        post_id: postId,
      });
      return { ok: true };
    }

    const error = (await response
      .json()
      .catch(() => null)) as DeletePostErrorResponse | null;

    return {
      ok: false,
      message: error?.message || "Failed to delete post",
    };
  } catch {
    return {
      ok: false,
      message: "Failed to delete post",
    };
  }
}

/** Broadcasts post:deleted so lists can drop the item. */
export function dispatchPostDeletedEvent(
  detail: PostDeletedEventDetail,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.dispatchEvent(
      new CustomEvent<PostDeletedEventDetail>("post:deleted", { detail }),
    );
    return true;
  } catch {
    return false;
  }
}

/** Refreshes member stats and activity after a post change. */
export async function invalidateMemberActivityQueries(
  queryClient: QueryClient,
): Promise<boolean> {
  const results = await Promise.allSettled([
    queryClient.invalidateQueries({ queryKey: ["member-stats"] }),
    queryClient.invalidateQueries({ queryKey: ["member-activity"] }),
  ]);

  return results.every((result) => result.status === "fulfilled");
}

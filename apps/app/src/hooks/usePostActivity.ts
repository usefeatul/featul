"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { useSession } from "@featul/auth/client";
import type { PostActivityPage } from "@featul/api/activity/post";
import type { CommentSurface } from "@/lib/comment/shared";
import type { InitialActivity } from "@/types/activity";

export function usePostActivity(
  postId: string,
  surface: CommentSurface,
  initialActivity?: InitialActivity,
) {
  const { data: session, isPending: sessionPending } = useSession();
  const userId = sessionPending
    ? (initialActivity?.userId ?? null)
    : (session?.user?.id ?? null);
  const initial =
    initialActivity?.userId === userId ? initialActivity : undefined;
  return useInfiniteQuery({
    queryKey: ["post-activity", postId, surface, userId, "details"],
    initialPageParam: 0,
    initialData: initial
      ? { pages: [initial.page], pageParams: [0] }
      : undefined,
    initialDataUpdatedAt: initial?.updatedAt,
    enabled: !sessionPending,
    queryFn: async ({ pageParam }): Promise<PostActivityPage> => {
      const response = await client.post.activity.$get({
        postId,
        surface,
        offset: pageParam,
      });
      if (!response.ok) throw new Error("Failed to load activity");
      return response.json();
    },
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    staleTime: 30_000,
    gcTime: 30 * 60_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

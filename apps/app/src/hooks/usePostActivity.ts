"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { useSession } from "@featul/auth/client";
import type { PostActivityPage } from "@featul/api/activity/post";
import type { CommentSurface } from "@/lib/comment/shared";

export function usePostActivity(postId: string, surface: CommentSurface) {
  const { data: session } = useSession();
  return useInfiniteQuery({
    queryKey: [
      "post-activity",
      postId,
      surface,
      session?.user?.id ?? null,
      "details",
    ],
    initialPageParam: 0,
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
    refetchOnWindowFocus: true,
  });
}

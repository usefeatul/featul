import { useEffect, useState } from "react";
import { client } from "@featul/api/client";
import type { AiSourcePost } from "@/components/changelog/AiSourcePostItem";

export function useAiSourcePosts(workspaceSlug: string, enabled: boolean) {
  const [sourcePosts, setSourcePosts] = useState<AiSourcePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const loadSourcePosts = async () => {
      setIsLoadingPosts(true);
      try {
        const res = await client.changelog.aiSourcePostsList.$get({
          slug: workspaceSlug,
          limit: 30,
        });
        const data = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (!res.ok || !("ok" in data) || !data.ok || !Array.isArray(data.posts)) {
          setSourcePosts([]);
          return;
        }

        setSourcePosts(data.posts as AiSourcePost[]);
      } catch {
        if (!cancelled) setSourcePosts([]);
      } finally {
        if (!cancelled) setIsLoadingPosts(false);
      }
    };

    void loadSourcePosts();
    return () => {
      cancelled = true;
    };
  }, [enabled, workspaceSlug]);

  return { sourcePosts, isLoadingPosts };
}

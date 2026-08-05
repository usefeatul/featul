"use client";

import React from "react";
import { client } from "@featul/api/client";
import type { RequestItemData } from "@/types/request";

function mapRoadmapPost(row: Record<string, unknown>): RequestItemData {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    content: (row.content as string | null) ?? null,
    image: (row.image as string | null) ?? null,
    commentCount: Number(row.commentCount ?? 0),
    upvotes: Number(row.upvotes ?? 0),
    roadmapStatus: (row.roadmapStatus as string | null) ?? null,
    roadmapOrder: Number(row.roadmapOrder ?? 0),
    publishedAt: row.publishedAt
      ? new Date(String(row.publishedAt)).toISOString()
      : null,
    createdAt: new Date(String(row.createdAt)).toISOString(),
    boardSlug: String(row.boardSlug ?? ""),
    boardName: String(row.boardName ?? ""),
    authorImage: (row.authorImage as string | null) ?? null,
    authorName: (row.authorName as string | null) ?? null,
    authorId: (row.authorId as string | null) ?? null,
    isAnonymous: Boolean(row.isAnonymous),
    isPinned: Boolean(row.isPinned),
    isLocked: Boolean(row.isLocked),
    isFeatured: Boolean(row.isFeatured),
    role: (row.role as RequestItemData["role"]) ?? null,
    reportCount: Number(row.reportCount ?? 0),
    tags: Array.isArray(row.tags) ? (row.tags as RequestItemData["tags"]) : [],
  };
}

export function useRoadmapLiveRefresh({
  workspaceSlug,
  enabled,
  onRefresh,
}: {
  workspaceSlug: string;
  enabled: boolean;
  onRefresh: (items: RequestItemData[]) => void;
}) {
  React.useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const res = await client.board.listRoadmapPosts.$get({
          slug: workspaceSlug,
          limit: 500,
          offset: 0,
        });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          posts?: Array<Record<string, unknown>>;
        };
        if (!cancelled && Array.isArray(data.posts)) {
          onRefresh(data.posts.map(mapRoadmapPost));
        }
      } catch {
        // Ignore polling failures silently.
      }
    };

    const intervalId = window.setInterval(poll, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled, onRefresh, workspaceSlug]);
}

export async function fetchRoadmapPostsPage(
  workspaceSlug: string,
  offset: number,
  limit: number,
) {
  const res = await client.board.listRoadmapPosts.$get({
    slug: workspaceSlug,
    limit,
    offset,
  });
  if (!res.ok) {
    throw new Error("Failed to load roadmap posts");
  }
  const data = (await res.json()) as {
    posts?: Array<Record<string, unknown>>;
    totalCount?: number;
  };
  return {
    posts: (data.posts || []).map(mapRoadmapPost),
    totalCount: Number(data.totalCount ?? 0),
  };
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { useBulkDelete } from "@/hooks/useBulkDelete";
import {
  deletePostById,
  dispatchPostDeletedEvent,
  invalidateMemberActivityQueries,
} from "@/lib/post-deletion";
import type {
  ChangelogDeletedEventDetail,
  ChangelogPageRefreshingDetail,
  PostDeletedEventDetail,
  RequestsPageRefreshingDetail,
} from "@/types/events";
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data";
import type { RequestItemData } from "@/types/request";

type BulkDeleteBaseParams<T> = {
  workspaceSlug: string;
  listKey: string;
  listItems: T[];
  initialTotalCount?: number;
  onItemsChange: (next: T[]) => void;
  onComplete?: () => void;
};

export function useBulkDeleteRequests({
  workspaceSlug,
  listKey,
  listItems,
  initialTotalCount,
  onItemsChange,
  onComplete,
}: BulkDeleteBaseParams<RequestItemData>) {
  const queryClient = useQueryClient();

  return useBulkDelete({
    listKey,
    listItems,
    getItemId: (item) => item.id,
    itemLabel: "post",
    initialTotalCount,
    onItemsChange,
    onComplete,
    deleteOne: deletePostById,
    onDeleted: async (okIds, items) => {
      const eventDispatchFailed = okIds.some((postId) => {
        const item = items.find((post) => post.id === postId);
        if (!item) return false;

        const detail: PostDeletedEventDetail = {
          postId,
          workspaceSlug,
          status: item.roadmapStatus ?? null,
        };

        return !dispatchPostDeletedEvent(detail);
      });

      if (eventDispatchFailed) {
        toast.error("Failed to delete posts");
      }

      const invalidated = await invalidateMemberActivityQueries(queryClient);
      if (!invalidated) {
        toast.error("Failed to invalidate queries");
      }
    },
    onPageEmpty: () => {
      try {
        const detail: RequestsPageRefreshingDetail = { workspaceSlug };
        window.dispatchEvent(
          new CustomEvent<RequestsPageRefreshingDetail>(
            "requests:page-refreshing",
            { detail },
          ),
        );
      } catch {
        toast.error("Failed to refresh page");
      }
    },
  });
}

export function useBulkDeleteChangelog({
  workspaceSlug,
  listKey,
  listItems,
  initialTotalCount,
  onItemsChange,
  onComplete,
}: BulkDeleteBaseParams<ChangelogEntryWithTags>) {
  return useBulkDelete({
    listKey,
    listItems,
    getItemId: (item) => item.id,
    itemLabel: "entry",
    itemLabelPlural: "entries",
    initialTotalCount,
    onItemsChange,
    onComplete,
    deleteOne: async (entryId) => {
      const response = await client.changelog.entriesDelete.$post({
        slug: workspaceSlug,
        entryId,
      });
      return { ok: Boolean(response?.ok) };
    },
    onDeleted: (okIds) => {
      okIds.forEach((entryId) => {
        const detail: ChangelogDeletedEventDetail = {
          entryId,
          workspaceSlug,
        };
        window.dispatchEvent(
          new CustomEvent<ChangelogDeletedEventDetail>("changelog:deleted", {
            detail,
          }),
        );
      });
    },
    onPageEmpty: () => {
      const detail: ChangelogPageRefreshingDetail = { workspaceSlug };
      window.dispatchEvent(
        new CustomEvent<ChangelogPageRefreshingDetail>(
          "changelog:page-refreshing",
          { detail },
        ),
      );
    },
  });
}

"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { pluralizeItemLabel } from "@/components/selection/pluralize";
import { getSelectedIds, removeSelectedIds } from "@/lib/selection/store";
import { normalizeRoadmapStatus } from "@/lib/roadmap";
import type { RequestItemData } from "@/types/request";

type StatusCounts = Record<string, number>;

type UseBulkStatusUpdateParams = {
  listKey: string;
  listItems: RequestItemData[];
  workspaceSlug: string;
  onItemsChange: (next: RequestItemData[]) => void;
};

type UseBulkStatusUpdateResult = {
  isPending: boolean;
  handleBulkStatus: (status: string) => void;
};

/** Sets status on selected requests. Patches status-count cache and drops those ids from selection. */
export function useBulkStatusUpdate({
  listKey,
  listItems,
  workspaceSlug,
  onItemsChange,
}: UseBulkStatusUpdateParams): UseBulkStatusUpdateResult {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleBulkStatus = useCallback(
    (status: string) => {
      startTransition(async () => {
        try {
          const ids = getSelectedIds(listKey);
          if (ids.length === 0) return;

          const nextStatus = normalizeRoadmapStatus(status);
          const idToPrevStatus = new Map(
            listItems.map((item) => [
              item.id,
              normalizeRoadmapStatus(item.roadmapStatus),
            ]),
          );

          const results = await Promise.all(
            ids.map(async (id) => {
              try {
                const res = await client.board.updatePostMeta.$post({
                  postId: id,
                  roadmapStatus: nextStatus,
                });
                return { id, ok: Boolean(res?.ok) };
              } catch {
                return { id, ok: false };
              }
            }),
          );

          const okIds = results.filter((r) => r.ok).map((r) => r.id);
          const failed = results.length - okIds.length;

          if (okIds.length > 0) {
            const okIdSet = new Set(okIds);

            onItemsChange(
              listItems.map((item) =>
                okIdSet.has(item.id)
                  ? { ...item, roadmapStatus: nextStatus }
                  : item,
              ),
            );
            removeSelectedIds(listKey, okIds);

            queryClient.setQueryData<StatusCounts>(
              ["status-counts", workspaceSlug],
              (prev) => {
                if (!prev) return prev;
                const copy: StatusCounts = { ...prev };
                for (const id of okIds) {
                  const prevStatus = idToPrevStatus.get(id);
                  if (!prevStatus || prevStatus === nextStatus) continue;
                  if (typeof copy[prevStatus] === "number") {
                    copy[prevStatus] = Math.max(0, (copy[prevStatus] || 0) - 1);
                  }
                  copy[nextStatus] = (copy[nextStatus] || 0) + 1;
                }
                return copy;
              },
            );

            queryClient.invalidateQueries({
              queryKey: ["status-counts", workspaceSlug],
            });
            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === "post-count" &&
                query.queryKey[1] === workspaceSlug,
            });

            router.refresh();
            toast.success(
              `Updated ${okIds.length} ${pluralizeItemLabel("post", okIds.length)}`,
            );
          }

          if (failed > 0) {
            toast.error(
              `Failed to update ${failed} ${pluralizeItemLabel("post", failed)}`,
            );
          }
        } catch {
          toast.error("Failed to update status");
        }
      });
    },
    [listKey, listItems, workspaceSlug, onItemsChange, queryClient, router],
  );

  return {
    isPending,
    handleBulkStatus,
  };
}

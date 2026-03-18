"use client";

import { useCallback, useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { getSelectedIds, removeSelectedIds } from "@/lib/selection-store";
import type {
  ChangelogDeletedEventDetail,
  ChangelogPageRefreshingDetail,
} from "@/types/events";
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data";

interface UseBulkDeleteChangelogParams {
  workspaceSlug: string;
  listKey: string;
  listItems: ChangelogEntryWithTags[];
  initialTotalCount?: number;
  onItemsChange: (next: ChangelogEntryWithTags[]) => void;
  onComplete?: () => void;
}

interface UseBulkDeleteChangelogResult {
  isPending: boolean;
  isRefetching: boolean;
  totalCount: number | null;
  handleBulkDelete: () => void;
}

export function useBulkDeleteChangelog({
  workspaceSlug,
  listKey,
  listItems,
  initialTotalCount,
  onItemsChange,
  onComplete,
}: UseBulkDeleteChangelogParams): UseBulkDeleteChangelogResult {
  const router = useRouter();
  const [isRefetching, setIsRefetching] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(
    typeof initialTotalCount === "number" ? initialTotalCount : null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof initialTotalCount === "number") {
      setTotalCount(initialTotalCount);
    }
  }, [initialTotalCount]);

  const handleBulkDelete = useCallback(() => {
    startTransition(async () => {
      try {
        const ids = getSelectedIds(listKey);
        if (ids.length === 0) {
          if (onComplete) {
            onComplete();
          }
          return;
        }

        // Loop through and delete each entry
        const results = await Promise.allSettled(
          ids.map((entryId) =>
            client.changelog.entriesDelete.$post({
              slug: workspaceSlug,
              entryId,
            }),
          ),
        );

        const okIds: string[] = [];
        const failed: number = results.reduce((acc, r, idx) => {
          const id = ids[idx];
          if (!id) return acc + 1;
          if (r.status === "fulfilled" && r.value?.ok) {
            okIds.push(id);
            return acc;
          }
          return acc + 1;
        }, 0);

        if (okIds.length > 0) {
          okIds.forEach((entryId) => {
            const detail: ChangelogDeletedEventDetail = {
              entryId,
              workspaceSlug,
            };
            window.dispatchEvent(
              new CustomEvent<ChangelogDeletedEventDetail>(
                "changelog:deleted",
                { detail },
              ),
            );
          });

          const remainingItems = listItems.filter((i) => !okIds.includes(i.id));
          const nextLength = remainingItems.length;
          const prevTotal = totalCount;
          const nextTotal =
            typeof prevTotal === "number"
              ? Math.max(prevTotal - okIds.length, 0)
              : prevTotal;

          if (typeof nextTotal === "number") {
            setTotalCount(nextTotal);
          }

          onItemsChange(remainingItems);
          removeSelectedIds(listKey, okIds);

          if (
            nextLength === 0 &&
            typeof nextTotal === "number" &&
            nextTotal > 0
          ) {
            setIsRefetching(true);
            const detail: ChangelogPageRefreshingDetail = { workspaceSlug };
            window.dispatchEvent(
              new CustomEvent<ChangelogPageRefreshingDetail>(
                "changelog:page-refreshing",
                { detail },
              ),
            );
            router.refresh();
          } else {
            router.refresh();
          }

          toast.success(
            `Deleted ${okIds.length} ${okIds.length === 1 ? "entry" : "entries"}`,
          );
        }

        if (failed > 0) {
          toast.error(
            `Failed to delete ${failed} ${failed === 1 ? "entry" : "entries"}`,
          );
        }
      } catch {
        toast.error("Failed to delete entries");
      } finally {
        if (onComplete) {
          onComplete();
        }
      }
    });
  }, [
    listKey,
    listItems,
    workspaceSlug,
    totalCount,
    router,
    onComplete,
    onItemsChange,
  ]);

  return {
    isPending,
    isRefetching,
    totalCount,
    handleBulkDelete,
  };
}

"use client";

import { useCallback, useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pluralizeItemLabel } from "@/components/selection/pluralize";
import { getSelectedIds, removeSelectedIds } from "@/lib/selection/store";

type DeleteResult = { ok: boolean };

type UseBulkDeleteParams<T> = {
  listKey: string;
  listItems: T[];
  getItemId: (item: T) => string;
  itemLabel: string;
  itemLabelPlural?: string;
  initialTotalCount?: number;
  onItemsChange: (next: T[]) => void;
  onComplete?: () => void;
  deleteOne: (id: string) => Promise<DeleteResult>;
  onDeleted?: (okIds: string[], listItems: T[]) => void | Promise<void>;
  onPageEmpty?: () => void;
};

type UseBulkDeleteResult = {
  isPending: boolean;
  isRefetching: boolean;
  totalCount: number | null;
  handleBulkDelete: () => void;
};

export function useBulkDelete<T>({
  listKey,
  listItems,
  getItemId,
  itemLabel,
  itemLabelPlural,
  initialTotalCount,
  onItemsChange,
  onComplete,
  deleteOne,
  onDeleted,
  onPageEmpty,
}: UseBulkDeleteParams<T>): UseBulkDeleteResult {
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
          onComplete?.();
          return;
        }

        const results = await Promise.all(ids.map((id) => deleteOne(id)));
        const okIds: string[] = [];
        const failed = results.reduce((acc, result, idx) => {
          const id = ids[idx];
          if (!id) return acc + 1;
          if (result.ok) {
            okIds.push(id);
            return acc;
          }
          return acc + 1;
        }, 0);

        if (okIds.length > 0) {
          await onDeleted?.(okIds, listItems);

          const okIdSet = new Set(okIds);
          const remainingItems = listItems.filter(
            (item) => !okIdSet.has(getItemId(item)),
          );
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
            onPageEmpty?.();
          }

          router.refresh();
          toast.success(
            `Deleted ${okIds.length} ${pluralizeItemLabel(itemLabel, okIds.length, itemLabelPlural)}`,
          );
        }

        if (failed > 0) {
          toast.error(
            `Failed to delete ${failed} ${pluralizeItemLabel(itemLabel, failed, itemLabelPlural)}`,
          );
        }
      } catch {
        toast.error(
          `Failed to delete ${pluralizeItemLabel(itemLabel, 2, itemLabelPlural)}`,
        );
      } finally {
        onComplete?.();
      }
    });
  }, [
    listKey,
    listItems,
    getItemId,
    itemLabel,
    itemLabelPlural,
    totalCount,
    router,
    onComplete,
    onItemsChange,
    deleteOne,
    onDeleted,
    onPageEmpty,
  ]);

  return {
    isPending,
    isRefetching,
    totalCount,
    handleBulkDelete,
  };
}

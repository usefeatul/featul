"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { deletePostById, dispatchPostDeletedEvent } from "@/lib/post-deletion";

export function useRequestItemActions({
  requestId,
  workspaceSlug,
  roadmapStatus,
  onSuccess,
}: {
  requestId: string;
  workspaceSlug?: string;
  roadmapStatus?: string | null;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const updateStatus = async (status: string) => {
    setIsPending(true);
    try {
      const res = await client.board.updatePostMeta.$post({
        postId: requestId,
        roadmapStatus: status,
      });
      if (res.ok) {
        toast.success("Status updated");
        router.refresh();
        queryClient.invalidateQueries({ queryKey: ["request", requestId] });
        onSuccess?.();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsPending(false);
    }
  };

  const deleteRequest = async () => {
    setIsPending(true);
    try {
      const result = await deletePostById(requestId);
      if (result.ok) {
        toast.success("Request deleted");
        if (workspaceSlug) {
          dispatchPostDeletedEvent({
            postId: requestId,
            workspaceSlug,
            status: roadmapStatus ?? null,
          });
        }
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to delete request");
    } finally {
      setIsPending(false);
    }
  };

  return {
    updateStatus,
    deleteRequest,
    isPending,
  };
}

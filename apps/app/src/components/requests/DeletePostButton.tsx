"use client";

import React, { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@featul/ui/components/button";
import { DeletePostConfirmDialog } from "@/components/global/DeletePostConfirmDialog";
import { TrashIcon } from "@featul/ui/icons/trash";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  deletePostById,
  dispatchPostDeletedEvent,
  invalidateMemberActivityQueries,
} from "@/lib/post-deletion";

export interface DeletePostButtonProps {
  postId: string;
  workspaceSlug?: string;
  backHref?: string;
  className?: string;
}

export function DeletePostButton({
  postId,
  workspaceSlug,
  backHref,
  className,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deletePostById(postId);
        if (result.ok) {
          toast.success("Post deleted successfully");

          if (workspaceSlug) {
            dispatchPostDeletedEvent({ postId, workspaceSlug, status: null });
          }

          void invalidateMemberActivityQueries(queryClient);

          const target = backHref || (workspaceSlug ? "/" : null);
          if (target) {
            router.push(target);
            router.refresh();
          } else {
            router.back();
            router.refresh();
          }
        } else {
          toast.error(result.message);
        }
      } finally {
        setConfirmOpen(false);
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="nav"
        size="icon-sm"
        className={`rounded-none border-none shadow-none hover:bg-background focus-visible:ring-0 focus-visible:ring-offset-0 ${className || ""}`}
        aria-label="Delete"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
      >
        <TrashIcon className="size-3.5" />
      </Button>
      <DeletePostConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

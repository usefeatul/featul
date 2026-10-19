"use client";

import React, { useState, useTransition } from "react";
import { TrashIcon } from "@/components/global/icons";
import { PopoverListItem } from "@featul/ui/components/popover";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deletePostById, dispatchPostDeletedEvent } from "@/lib/post/deletion";

interface RequestDeleteActionProps {
  postId: string;
  workspaceSlug?: string;
}

/** Delete flow shared by the post menu and the sidebar actions. */
export function useDeletePost(postId: string, workspaceSlug?: string) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deletePostById(postId);
        if (result.ok) {
          toast.success("Post deleted successfully");
          dispatchPostDeletedEvent({
            postId,
            workspaceSlug: workspaceSlug || "",
            status: "deleted",
          });

          if (workspaceSlug) {
            // Force navigation to the home/list page instead of back()
            // This avoids stale state from browser back-forward cache
            router.push(`/`);
            router.refresh();
          } else {
            router.back();
            router.refresh();
          }
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Failed to delete post");
      } finally {
        setOpen(false);
      }
    });
  };

  const dialog = (
    <DestructiveConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        setOpen(next);
      }}
      isPending={isPending}
      onConfirm={handleDelete}
      title="Are you absolutely sure?"
      description="This will permanently delete this post. This action cannot be undone."
    />
  );

  return { openConfirm: () => setOpen(true), dialog };
}

export function RequestDeleteAction({
  postId,
  workspaceSlug,
}: RequestDeleteActionProps) {
  const { openConfirm, dialog } = useDeletePost(postId, workspaceSlug);

  return (
    <>
      <PopoverListItem
        onClick={openConfirm}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
      >
        <span className="text-sm">Delete</span>
        <TrashIcon className="ml-auto size-4" />
      </PopoverListItem>

      {dialog}
    </>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import { TrashIcon } from "@featul/ui/icons/trash";
import { PopoverListItem } from "@featul/ui/components/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@featul/ui/components/alert-dialog";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { PostDeletedEventDetail } from "@/types/events";

interface RequestDeleteActionProps {
  postId: string;
  workspaceSlug?: string;
}

export function RequestDeleteAction({
  postId,
  workspaceSlug,
}: RequestDeleteActionProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await client.post.delete.$post({ postId });
        if (res.ok) {
          toast.success("Post deleted successfully");
          try {
            const detail: PostDeletedEventDetail = {
              postId,
              workspaceSlug: workspaceSlug || "",
              status: "deleted",
            };
            window.dispatchEvent(
              new CustomEvent<PostDeletedEventDetail>("post:deleted", {
                detail,
              })
            );
          } catch {}

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
          const err = (await res.json().catch(() => null)) as {
            message?: string;
          } | null;
          toast.error(err?.message || "Failed to delete post");
        }
      } catch (error) {
        console.error("Failed to delete post:", error);
        toast.error("Failed to delete post");
      } finally {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <PopoverListItem
        onClick={() => setOpen(true)}
        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
      >
        <span className="text-sm">Delete</span>
        <TrashIcon className="ml-auto size-4" />
      </PopoverListItem>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (isPending) return;
          setOpen(next);
        }}
      >
        <AlertDialogContent className="p-1 bg-muted rounded-xl gap-2">
          <AlertDialogHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <AlertDialogTitle className="flex items-center gap-2 px-2 mt-1 py-1 text-sm font-normal">
              <TrashIcon width={18} height={18} className="opacity-80" />
              Are you absolutely sure?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
            <AlertDialogDescription className="space-y-3 text-sm text-accent mb-2">
              <span className="block">
                This will permanently delete this post. This action cannot be
                undone.
              </span>
            </AlertDialogDescription>
            <AlertDialogFooter className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel
                disabled={isPending}
                className="h-8 px-3 text-sm"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                disabled={isPending}
                className="h-8 px-4 text-sm bg-red-500 hover:bg-red-600 text-white"
              >
                {isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

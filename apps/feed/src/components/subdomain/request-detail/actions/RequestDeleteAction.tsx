"use client";

import React, { useState, useTransition } from "react";
import { TrashIcon } from "@oreilla/ui/icons/trash";
import { PopoverListItem } from "@oreilla/ui/components/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@oreilla/ui/components/alert-dialog";
import { client } from "@oreilla/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
          // Dispatch global event for optimistic UI updates in parent lists
          try {
            window.dispatchEvent(
              new CustomEvent("post:deleted", { detail: { postId } })
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
          const err = await res.json();
          toast.error((err as any)?.message || "Failed to delete post");
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-accent">
              Are you sure you want to delete this post?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@featul/ui/components/alert-dialog";
import { AlertDialogShell } from "@/components/global/AlertDialogShell";

type DeletePostConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
  description?: string;
};

export function DeletePostConfirmDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
  description = "This will permanently delete this post.",
}: DeletePostConfirmDialogProps) {
  return (
    <AlertDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Are you absolutely sure?"
      description={description}
    >
      <AlertDialogFooter className="mt-2 flex justify-end gap-2">
        <AlertDialogCancel disabled={isPending} className="h-8 px-3 text-sm">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          disabled={isPending}
          className="h-8 bg-red-500 px-4 text-sm text-white hover:bg-red-600"
        >
          {isPending ? "Deleting..." : "Delete"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogShell>
  );
}

"use client";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@featul/ui/components/alert-dialog";
import { AlertDialogShell } from "@/components/global/AlertDialogShell";

type DestructiveConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  pendingLabel?: string;
  confirmClassName?: string;
};

export function DestructiveConfirmDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  pendingLabel = "Deleting...",
  confirmClassName = "h-8 bg-red-500 px-4 text-sm text-white hover:bg-red-600",
}: DestructiveConfirmDialogProps) {
  return (
    <AlertDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
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
          className={confirmClassName}
        >
          {isPending ? pendingLabel : confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogShell>
  );
}

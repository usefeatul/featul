"use client";

import React from "react";
import { useChangelogEntryActions } from "../../hooks/useChangelogEntryActions";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";

interface ChangelogDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceSlug: string;
  entryId: string;
  onSuccess?: () => void;
}

export function ChangelogDeleteDialog({
  open,
  onOpenChange,
  workspaceSlug,
  entryId,
  onSuccess,
}: ChangelogDeleteDialogProps) {
  const { deleteEntry, isPending } = useChangelogEntryActions({
    workspaceSlug,
    entryId,
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const handleDelete = () => {
    deleteEntry();
  };

  return (
    <DestructiveConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      isPending={isPending}
      onConfirm={handleDelete}
      title="Delete Entry"
      description="Are you sure you want to delete this changelog entry? This action cannot be undone."
      confirmClassName="h-8 px-4 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
    />
  );
}

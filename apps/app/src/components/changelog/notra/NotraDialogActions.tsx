"use client";

import { Button } from "@featul/ui/components/button";
import { LoaderIcon } from "@featul/ui/icons/loader";

type NotraDialogActionsProps = {
  hasStoredConnection: boolean;
  isPending: boolean;
  isSubmitDisabled: boolean;
  onDeleteStoredConnection: () => void;
  onCancel: () => void;
};

export function NotraDialogActions({
  hasStoredConnection,
  isPending,
  isSubmitDisabled,
  onDeleteStoredConnection,
  onCancel,
}: NotraDialogActionsProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <div>
        {hasStoredConnection ? (
          <Button
            type="button"
            variant="nav"
            onClick={onDeleteStoredConnection}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            Remove Connection
          </Button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="card" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitDisabled}>
          {isPending ? <LoaderIcon className="size-4 animate-spin" /> : null}
          Sync Now
        </Button>
      </div>
    </div>
  );
}

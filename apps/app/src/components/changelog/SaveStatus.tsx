"use client";

import { cn } from "@featul/ui/lib/utils";
import { InfoIcon, LoaderIcon, TickIcon } from "@/components/global/icons";
import { ActionTooltip } from "@/components/global/ActionTooltip";

interface SaveStatusProps {
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  className?: string;
}

const LABELS = {
  saving: "Saving…",
  dirty: "Unsaved changes · click to save",
  saved: "All changes saved",
} as const;

/** Bare save icon for the editor corner; only clickable when there is something to save. */
export function SaveStatus({ isSaving, isDirty, onSave, className }: SaveStatusProps) {
  const state = isSaving ? "saving" : isDirty ? "dirty" : "saved";

  return (
    <div className={cn("z-20", className)} role="status" aria-live="polite">
      <ActionTooltip label={LABELS[state]} side="top">
        <button
          type="button"
          // aria-disabled rather than disabled so the tooltip still shows on hover.
          aria-disabled={state !== "dirty"}
          aria-label={LABELS[state]}
          onClick={() => state === "dirty" && onSave()}
          className={cn(
            "flex size-6 items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
            state === "dirty" ? "cursor-pointer transition-opacity hover:opacity-70" : "cursor-default",
          )}
        >
          {state === "saving" ? (
            <LoaderIcon className="size-4 text-yellow-600 dark:text-yellow-400" />
          ) : state === "dirty" ? (
            <InfoIcon className="size-4 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <TickIcon className="size-4 text-green-600 dark:text-green-400" />
          )}
        </button>
      </ActionTooltip>
    </div>
  );
}

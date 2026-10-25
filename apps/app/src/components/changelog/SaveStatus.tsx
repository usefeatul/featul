"use client";

import { cn } from "@featul/ui/lib/utils";
import { ActionTooltip } from "@/components/global/ActionTooltip";

interface SaveStatusProps {
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
  className?: string;
}

type SaveState = "saving" | "dirty" | "saved";

const LABELS: Record<SaveState, string> = {
  saving: "Saving",
  dirty: "Unsaved",
  saved: "Saved",
};

/** Tabler's filled cloud, so it matches the other filled workspace icons. */
const CLOUD_PATH =
  "M10.04 4.305c2.195 -.667 4.615 -.224 6.36 1.176c1.386 1.108 2.188 2.686 2.252 4.34l.003 .212l.091 .003c2.3 .107 4.143 1.961 4.25 4.27l.004 .211c0 2.407 -1.885 4.372 -4.255 4.482l-.21 .005h-11.878l-.222 -.008c-2.94 -.11 -5.317 -2.399 -5.43 -5.263l-.005 -.216c0 -2.747 2.08 -5.01 4.784 -5.417l.114 -.016l.07 -.181c.663 -1.62 2.056 -2.906 3.829 -3.518l.244 -.08z";

/**
 * The cloud's colour carries the state (amber while unsaved, green while saving, grey once
 * saved) and fades between them. Its centre mark is drawn in the page colour so it reads as
 * cut out of the cloud: a spinning arc while saving, and a check that pops in once saved.
 */
function CloudStatusIcon({ state }: { state: SaveState }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
      <path d={CLOUD_PATH} fill="currentColor" />
      {state === "saved" ? (
        <path
          d="M9.4 13.6l1.9 1.9l3.5 -3.6"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="origin-center stroke-background animate-in fade-in zoom-in-50 duration-300 [transform-box:fill-box] motion-reduce:animate-none"
        />
      ) : null}
      {state === "saving" ? (
        <g className="origin-center animate-spin [transform-box:fill-box] motion-reduce:animate-none">
          <circle
            cx={12.2}
            cy={13.4}
            r={2.7}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="60 100"
            className="stroke-background"
          />
        </g>
      ) : null}
    </svg>
  );
}

/** Bare save icon for the editor corner; only clickable when there is something to save. */
export function SaveStatus({ isSaving, isDirty, onSave, className }: SaveStatusProps) {
  const state: SaveState = isSaving ? "saving" : isDirty ? "dirty" : "saved";

  return (
    <div className={cn("z-20", className)} role="status" aria-live="polite">
      <ActionTooltip label={LABELS[state]} side="top">
        <button
          type="button"
          // aria-disabled rather than disabled so the tooltip still shows on hover.
          aria-disabled={state !== "dirty"}
          // The one-word tooltip doesn't say the button saves, so screen readers get the action.
          aria-label={state === "dirty" ? "Save changes" : LABELS[state]}
          onClick={() => state === "dirty" && onSave()}
          className={cn(
            "flex size-6 items-center justify-center rounded-md outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring",
            state === "dirty" && "cursor-pointer text-amber-500 hover:text-amber-600 dark:hover:text-amber-400",
            state === "saving" && "cursor-default text-green-500 dark:text-green-400",
            state === "saved" && "cursor-default text-accent",
          )}
        >
          <CloudStatusIcon state={state} />
        </button>
      </ActionTooltip>
    </div>
  );
}

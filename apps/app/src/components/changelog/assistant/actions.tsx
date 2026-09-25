"use client";

import type { AppIcon } from "@/components/global/icons";

export type AssistantAction = {
  label: string;
  prompt: string;
  icon: AppIcon;
  attachFeedback?: boolean;
  attachThisWeek?: boolean;
  publishCheck?: boolean;
};

export function Actions({
  actions,
  disabled,
  onSelect,
}: {
  actions: AssistantAction[];
  disabled?: boolean;
  onSelect: (action: AssistantAction) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(action)}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border/80 px-2.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-black/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/[0.05]"
          >
            <Icon className="size-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

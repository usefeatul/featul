import React from "react";
import { Button } from "@featul/ui/components/button";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
};

export default function SettingsCard({
  icon,
  title,
  description,
  buttonLabel = "Import",
  onAction,
  disabled = false,
}: Props) {
  return (
    <div className="rounded-xl bg-muted/40 dark:bg-muted/20 overflow-hidden p-2 border border-border">
      {/* Header row */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 text-muted-foreground">
            {icon}
          </div>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <Button
          variant="card"
          size="sm"
          onClick={onAction}
          disabled={disabled}
          className="h-7 px-3 text-xs font-medium"
        >
          {buttonLabel}
        </Button>
      </div>
      {/* Description section */}
      <div className="px-4 py-3 bg-card ring-1 ring-border/60 ring-offset-1 ring-offset-background rounded-lg min-h-[60px]">
        <p className="text-sm text-accent leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

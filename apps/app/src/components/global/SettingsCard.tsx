import React from "react";
import { Button } from "@featul/ui/components/button";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  isConnected?: boolean;
  onTest?: () => void;
};

export default function SettingsCard({
  icon,
  title,
  description,
  buttonLabel = "Import",
  onAction,
  disabled = false,
  isConnected = false,
  onTest,
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
          {isConnected && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isConnected && onTest && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onTest}
              disabled={disabled}
              className="h-7 px-3 text-xs font-medium"
            >
              Test
            </Button>
          )}
          <Button
            variant={isConnected ? "outline" : "card"}
            size="sm"
            onClick={onAction}
            disabled={disabled}
            className="h-7 px-3 text-xs font-medium"
          >
            {buttonLabel}
          </Button>
        </div>
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


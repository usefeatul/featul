import React from "react";
import { Button } from "@featul/ui/components/button";
import { Card } from "@featul/ui/components/card";
import { LoaderIcon } from "@featul/ui/icons/loader";

type Props = {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  buttonLabel?: string;
  buttonVariant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "card" | "plain";
  onAction?: () => void;
  href?: string;
  disabled?: boolean;
  isConnected?: boolean;
  isLoading?: boolean;
  onTest?: () => void;
  children?: React.ReactNode;
};

export default function SettingsCard({
  icon,
  title,
  description,
  buttonLabel = "Import",
  buttonVariant = "card",
  onAction,
  href,
  disabled = false,
  isConnected = false,
  isLoading = false,
  onTest,
  children,
}: Props) {
  return (
    <Card className="rounded-xl bg-muted/40 dark:bg-muted/20 overflow-hidden px-2 pt-2 pb-2 border border-border gap-0
    " variant="plain">
      <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center justify-center size-5 shrink-0">
            {icon}
          </div>
          <span className="mt-0.5 text-sm font-medium leading-none text-foreground">{title}</span>
          {isConnected && (
            <span className="text-xs px-2 py-0.5  rounded-md border border-border/80  bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Connected
            </span>
          )}
        </div>
        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          {children ? (
            children
          ) : (
            <>
              {isConnected && onTest && (
                <Button
                  onClick={onTest}
                  size="xs"
                  disabled={disabled}
                >
                  Test
                </Button>
              )}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-7 px-3 text-xs font-medium rounded-md bg-card border border-border hover:bg-muted transition-colors"
                >
                  {buttonLabel}
                </a>
              ) : (
                <Button
                  variant={buttonVariant}
                  onClick={onAction}
                  disabled={disabled || isLoading}
                >
                  {isLoading ? <LoaderIcon className="animate-spin" size={16} /> : buttonLabel}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      {/* Description section */}
      <div className="px-4 pt-3 pb-2 bg-card dark:bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black rounded-lg min-h-[60px]">
        <div className="text-sm text-accent leading-relaxed break-words">
          {description}
        </div>
      </div>
    </Card>
  );
}

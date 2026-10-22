import React from "react";
import { Button } from "@featul/ui/components/button";
import { LoaderIcon } from "@/components/global/icons";
import {
  settingsSectionClass,
  settingsSurfaceClass,
  settingsSurfaceHeaderClass,
} from "@/components/settings/global/SectionCard";

type Props = {
  /** `stacked` puts the action under the description, for half-width grid cards. */
  layout?: "card" | "row" | "stacked";
  icon?: React.ReactNode;
  title: string;
  description: React.ReactNode;
  buttonLabel?: string;
  buttonVariant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link"
    | "card"
    | "plain";
  onAction?: () => void;
  href?: string;
  disabled?: boolean;
  isConnected?: boolean;
  isLoading?: boolean;
  onTest?: () => void;
  children?: React.ReactNode;
};

export default function SettingsCard({
  layout = "card",
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
  const stacked = layout === "stacked";
  const inline = !stacked && typeof description === "string";
  const controls = (
    <div
      className={`flex max-w-full flex-wrap items-center gap-2 ${stacked ? "justify-start" : "justify-end"}`}
    >
      {children ?? (
        <>
          {isConnected && onTest && (
            <Button onClick={onTest} size="xs" disabled={disabled}>
              Test
            </Button>
          )}
          {href ? (
            <Button asChild variant="outline" size="sm">
              <a href={href} target="_blank" rel="noopener noreferrer">
                {buttonLabel}
              </a>
            </Button>
          ) : (
            <Button
              variant={buttonVariant}
              onClick={onAction}
              disabled={disabled || isLoading}
            >
              {isLoading ? <LoaderIcon size={16} /> : buttonLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );

  if (layout === "row") {
    return (
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon ? (
            <div className="flex size-5 shrink-0 items-center justify-center">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              {isConnected ? (
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                  Connected
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
        <div className="min-w-0 sm:shrink-0">{controls}</div>
      </div>
    );
  }

  return (
    <section className={`${settingsSectionClass} ${stacked ? "h-full" : ""}`}>
      <header className={settingsSurfaceHeaderClass}>
        <div className="flex min-w-0 items-center gap-2.5">
          {icon ? (
            <div className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
              {icon}
            </div>
          ) : null}
          <h2 className="text-sm font-medium leading-6 text-foreground">
            {title}
          </h2>
          {isConnected && (
            <span className="rounded-lg bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Connected
            </span>
          )}
        </div>
        {!inline && !stacked && controls}
      </header>
      <div
        className={`${settingsSurfaceClass} ${stacked ? "flex flex-1 flex-col gap-4" : ""}`}
      >
        {stacked ? (
          <>
            <div className="text-sm leading-relaxed text-muted-foreground wrap-break-word">
              {description}
            </div>
            <div className="mt-auto">{controls}</div>
          </>
        ) : inline ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1 text-sm leading-relaxed text-muted-foreground wrap-break-word">
              {description}
            </div>
            <div className="min-w-0 sm:shrink-0">{controls}</div>
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-muted-foreground wrap-break-word">
            {description}
          </div>
        )}
      </div>
    </section>
  );
}

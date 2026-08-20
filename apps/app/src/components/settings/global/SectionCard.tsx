import React from "react";
import { cn } from "@featul/ui/lib/utils";

export const settingsTableShellClass =
  "overflow-hidden rounded-lg border border-border/60 bg-background dark:border-white/10 dark:bg-black/30";

export const settingsCardShellClass =
  "flex flex-col overflow-hidden rounded-xl border border-border bg-card px-2 pt-2 pb-2 text-foreground dark:border-white/10 dark:bg-black";

export const settingsCardInnerClass =
  "flex flex-1 flex-col rounded-lg bg-background px-4 py-3 ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black";

export default function SectionCard({
  title,
  description,
  children,
  action,
  icon,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(settingsCardShellClass, className)}>
      <header className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? (
            <div className="flex size-5 shrink-0 items-center justify-center">{icon}</div>
          ) : null}
          <h2 className="mt-0.5 text-sm font-medium leading-none text-foreground">{title}</h2>
        </div>
        {action ? (
          <div className="flex w-full shrink-0 items-center justify-end sm:w-auto sm:pl-4">
            {action}
          </div>
        ) : null}
      </header>
      {description || children ? (
        <div className={settingsCardInnerClass}>
          {description ? (
            <div
              className={cn(
                "text-sm leading-relaxed text-accent wrap-break-word",
                children ? "mb-3" : "",
              )}
            >
              {description}
            </div>
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}

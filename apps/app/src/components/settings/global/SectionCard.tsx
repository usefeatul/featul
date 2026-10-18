import React from "react";
import { cn } from "@featul/ui/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  InfoIcon,
  LockIcon,
} from "@/components/global/icons";

export type SectionCardStatus = {
  tone: "warning" | "info" | "success" | "neutral";
  label: string;
  message?: React.ReactNode;
};

const statusStyles = {
  neutral: {
    footer: "bg-linear-to-r from-muted/50 to-muted/20",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
    icon: LockIcon,
  },
  warning: {
    footer:
      "bg-linear-to-r from-orange-500/[0.12] to-orange-500/[0.05] dark:from-orange-400/[0.16] dark:to-orange-400/[0.06]",
    text: "text-orange-700 dark:text-orange-300",
    badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
    icon: AlertCircle,
  },
  info: {
    footer:
      "bg-linear-to-r from-blue-500/[0.12] to-blue-500/[0.05] dark:from-blue-400/[0.16] dark:to-blue-400/[0.06]",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    icon: InfoIcon,
  },
  success: {
    footer:
      "bg-linear-to-r from-emerald-500/[0.12] to-emerald-500/[0.05] dark:from-emerald-400/[0.16] dark:to-emerald-400/[0.06]",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle,
  },
};

export const settingsPlanCardCurrentClass =
  "border-primary dark:border-primary/80";

export const settingsTableShellClass =
  "overflow-hidden rounded-lg border border-border/50 bg-background/50";

export const settingsSectionClass =
  "flex min-w-0 flex-col gap-3 text-foreground";

export const settingsSurfaceClass =
  "min-w-0 overflow-hidden rounded-[calc(var(--radius)*2)] border border-border/50 bg-card px-5 py-4 shadow-xs dark:border-transparent dark:shadow-none";

export const settingsCardShellClass =
  "flex flex-col overflow-hidden rounded-lg border border-border/70 bg-sidebar px-2 pt-2 pb-2 text-foreground dark:border-white/[0.07]";

export const settingsCardInnerClass =
  "flex flex-1 flex-col rounded-lg bg-card px-4 py-3 ring-1 ring-border/45 dark:bg-background dark:ring-white/[0.055]";

export default function SectionCard({
  title,
  description,
  children,
  action,
  icon,
  className,
  contentClassName,
  status,
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  status?: SectionCardStatus;
}) {
  const statusStyle = status ? statusStyles[status.tone] : undefined;
  const StatusIcon = statusStyle?.icon;

  return (
    <section className={cn(settingsSectionClass, className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {icon ? (
            <div className="flex size-5 shrink-0 items-center justify-center">
              {icon}
            </div>
          ) : null}
          <h2 className="text-sm font-medium leading-6 text-foreground">
            {title}
          </h2>
          {status ? (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-xs font-medium",
                statusStyle?.badge,
              )}
            >
              {status.label}
            </span>
          ) : null}
        </div>
        {action ? (
          <div className="flex shrink-0 items-center justify-end">{action}</div>
        ) : null}
      </header>
      {description || children || status?.message ? (
        <div
          className={cn(
            status?.message &&
              "overflow-hidden rounded-[calc(var(--radius)*2)] border border-border/50 bg-card shadow-xs dark:border-transparent dark:shadow-none",
          )}
        >
          <div
            className={cn(
              settingsSurfaceClass,
              status?.message && "rounded-none border-0 shadow-none",
              contentClassName,
            )}
          >
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
          {status?.message && StatusIcon ? (
            <div
              role="status"
              className={cn(
                "flex items-start gap-2 border-t border-border/30 px-5 py-3 text-xs leading-5 text-muted-foreground",
                statusStyle?.footer,
              )}
            >
              <StatusIcon
                className={cn("mt-0.5 size-4 shrink-0", statusStyle?.text)}
                aria-hidden
              />
              <div className="min-w-0 wrap-break-word">{status.message}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

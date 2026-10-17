import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/global/icons";
import { cn } from "@featul/ui/lib/utils";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: ReactNode;
  children?: ReactNode;
  onAction?: () => void;
  disabled?: boolean;
};

export default function SettingsEntry({
  icon,
  title,
  description,
  badge,
  children,
  onAction,
  disabled,
}: Props) {
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background/70 [&_svg]:size-5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
          {title}
          {badge}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </>
  );
  const rowClass = "flex w-full items-center gap-4 py-4 text-left";

  if (onAction) {
    return (
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className={cn(
          rowClass,
          "group relative transition-colors enabled:cursor-pointer enabled:hover:bg-muted/50 focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
        )}
      >
        {content}
        <span className="shrink-0 text-muted-foreground">
          {disabled ? (
            children
          ) : (
            <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          )}
        </span>
      </button>
    );
  }

  return (
    <div className={cn(rowClass, "flex-wrap sm:flex-nowrap")}>
      {content}
      <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
        {children}
      </div>
    </div>
  );
}

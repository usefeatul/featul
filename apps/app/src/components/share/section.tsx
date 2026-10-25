import type { ReactNode } from "react";
import { modalCardInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import {
  settingsSectionClass,
  settingsSurfaceHeaderClass,
} from "@/components/settings/global/SectionCard";

/**
 * A share section in the settings card style: the title and description sit in the outer
 * shell and the content in the inner card. `flush` lets lists and previews run edge to edge
 * instead of sitting in the padded body.
 */
export default function ShareSection({
  title,
  description,
  badge,
  children,
  actions,
  flush = false,
}: {
  title: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  flush?: boolean;
}) {
  return (
    <section aria-label={title} className={settingsSectionClass}>
      <header className={settingsSurfaceHeaderClass}>
        <div className="flex min-w-0 items-center gap-3">
          <h3 className="text-sm font-medium leading-6 text-foreground">
            {title}
          </h3>
          {badge}
        </div>
        {description ? (
          <p className="min-w-0 text-xs leading-6 text-accent sm:text-right">
            {description}
          </p>
        ) : null}
      </header>
      <div className={cn(modalCardInnerClass, "min-w-0")}>
        {flush ? children : <div className="space-y-4 p-5">{children}</div>}
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-5 py-3 dark:border-white/[0.06]">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

export function WidgetSection({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3 text-foreground">
      <h2 className="px-1 text-sm font-medium leading-6">Widget</h2>
      <div className="min-w-0 divide-y divide-border/50 rounded-[calc(var(--radius)*2)] border border-border/50 bg-card px-5 shadow-xs dark:border-transparent dark:shadow-none">
        {children}
      </div>
    </section>
  );
}

export function WidgetRow({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-5 shrink-0 items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </div>
        </div>
      </div>
      <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2 sm:shrink-0">
        {children}
      </div>
    </div>
  );
}

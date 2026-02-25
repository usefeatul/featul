import React from "react";

export default function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-3 overflow-hidden rounded-md border border-border bg-card text-foreground ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:border-border dark:bg-black/50 dark:ring-offset-black">
      <header className="flex flex-col gap-3 border-b border-border/70 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-heading leading-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm font-light leading-relaxed text-accent">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0 sm:pl-4">{action}</div> : null}
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

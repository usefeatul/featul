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
    <section className="mb-3 overflow-hidden rounded-md bg-[var(--workspace-surface)] text-foreground">
      <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-heading font-semibold">{title}</h2>
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

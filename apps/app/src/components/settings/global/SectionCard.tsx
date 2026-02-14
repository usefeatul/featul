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
    <div className="relative mb-2 overflow-hidden rounded-sm border border-border bg-card text-foreground ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:border-border dark:bg-background dark:ring-offset-black before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)]">
      <div className="relative z-10 flex items-center justify-between border-b border-border/70 p-4">
        <div>
          <div className="text-lg font-heading">{title}</div>
          {description ? (
            <div className="text-sm text-accent mt-1">{description}</div>
          ) : null}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="relative z-10 px-2 pb-2 pt-2">{children}</div>
    </div>
  );
}

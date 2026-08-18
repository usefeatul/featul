import type { ReactNode } from "react";

export function WidgetEmpty({
  title,
  description,
  icon,
  compact = false,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={
        compact
          ? "flex flex-col items-center px-5 py-6 text-center"
          : "flex min-h-0 flex-1 flex-col items-center px-6 pb-8 pt-16 text-center"
      }
    >
      {icon ? (
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-[rgb(var(--widget-fg)/0.06)] text-[rgb(var(--widget-fg)/0.5)]">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-medium text-[rgb(var(--widget-fg))]">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function WidgetSectionEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <p className="text-sm text-[rgb(var(--widget-fg)/0.45)]">{children}</p>
    </div>
  );
}

export function WidgetEmptyPlaceholders() {
  const rows = [
    { meta: "w-16", title: "w-[90%]" },
    { meta: "w-12", title: "w-[72%]" },
    { meta: "w-14", title: "w-[80%]" },
  ];

  return (
    <div className="mt-6 w-full max-w-[260px] space-y-2" aria-hidden>
      {rows.map((row) => (
        <div
          key={row.title}
          className="rounded-md bg-[rgb(var(--widget-fg)/0.04)] px-3 py-2.5 text-left"
        >
          <div className={`h-2 rounded-full bg-[rgb(var(--widget-fg)/0.1)] ${row.meta}`} />
          <div className={`mt-2 h-2.5 rounded-full bg-[rgb(var(--widget-fg)/0.08)] ${row.title}`} />
        </div>
      ))}
    </div>
  );
}

export function WidgetEmpty({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-[rgb(var(--widget-fg))]">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-[rgb(var(--widget-fg)/0.45)]">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function WidgetSectionEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <p className="text-sm text-[rgb(var(--widget-fg)/0.45)]">{children}</p>
    </div>
  );
}

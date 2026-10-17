import type { ReactNode } from "react";

export default function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description ? (
          <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-2">{children}</div>
    </div>
  );
}

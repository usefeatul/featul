import type { ReactNode } from "react";
import SectionCard from "../../global/SectionCard";

export function WidgetSection({ children }: { children: ReactNode }) {
  return (
    <SectionCard
      title="Widget"
      contentClassName="divide-y divide-border/50 p-0"
    >
      {children}
    </SectionCard>
  );
}

export function WidgetRow({
  icon,
  title,
  description,
  content,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  content?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-5 shrink-0 items-center justify-center">
            {icon}
          </div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-52 sm:shrink-0">
          {children}
        </div>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </div>
      {content}
    </div>
  );
}

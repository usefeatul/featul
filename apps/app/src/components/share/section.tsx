import type { ReactNode } from "react";
import { shareSectionLabelClass } from "./styles";

export default function ShareSection({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section aria-label={title} className="space-y-4">
      <header>
        <h3 className={shareSectionLabelClass}>{title}</h3>
        <p className="mt-1.5 text-sm text-accent">{description}</p>
      </header>
      {children}
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </section>
  );
}

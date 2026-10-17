import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";
import { shareCardClass, shareFooterClass } from "./styles";

export default function ShareCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className={cn(shareCardClass, "flex flex-col")}>
      <header className="px-5 pb-2 pt-5">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-accent">{description}</p>
      </header>
      <div className="flex min-h-48 flex-1 flex-col justify-center px-5 py-5">
        {children}
      </div>
      <footer className={shareFooterClass}>{footer}</footer>
    </section>
  );
}

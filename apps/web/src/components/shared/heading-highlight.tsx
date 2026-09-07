import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";

export const headingHighlightClass =
  "inline-flex items-center rounded-md border border-border bg-muted/60 px-1.5 py-[2px] align-baseline text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.06)] sm:px-2";

export const marketingDisplayHeadingClass =
  "font-heading text-balance text-[2rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl sm:leading-tight lg:text-[2.75rem]";

export const marketingLeadClass =
  "mt-4 max-w-xl text-base font-light leading-relaxed text-accent sm:mt-6 sm:text-lg";

export function HeadingHighlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn(headingHighlightClass, className)}>{children}</span>;
}

"use client";

import { cn } from "@featul/ui/lib/utils";
import { usePathname } from "next/navigation";

type SeparatorVariant = "striped" | "line";

interface LinearSeparatorProps {
  className?: string;
  variant?: SeparatorVariant;
}

const LINE_VARIANT_CLASS =
  "h-px w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.08)_100%)] bg-[length:100%_1px] bg-no-repeat bg-origin-content";

const STRIPED_WRAPPER_CLASS = "relative h-14 w-full px-2 sm:h-18 md:px-0";
const STRIPED_FRAME_CLASS =
  "absolute inset-y-0 left-1 right-1 bg-neutral-50 md:left-0 md:right-0";
const STRIPED_RULES_CLASS =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.1),rgba(0,0,0,0.1)),linear-gradient(to_right,rgba(0,0,0,0.1),rgba(0,0,0,0.1))] bg-[length:100%_1px,100%_1px] bg-[position:left_top,left_bottom] bg-no-repeat";
const STRIPED_DOTS_CLASS =
  "absolute inset-x-1 bottom-1 top-1 bg-[radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_1px)] bg-[length:12px_12px] bg-repeat bg-top opacity-45";

export function LinearSeparator({
  className,
  variant = "striped",
}: LinearSeparatorProps) {
  const pathname = usePathname();

  // Hide on docs pages
  if (pathname?.startsWith("/docs")) {
    return null;
  }

  if (variant === "line") {
    return <div className={cn(LINE_VARIANT_CLASS, className)} />;
  }

  return (
    <div className={cn(STRIPED_WRAPPER_CLASS, className)}>
      <div className={STRIPED_FRAME_CLASS}>
        <div className={STRIPED_RULES_CLASS} />
        <div className={STRIPED_DOTS_CLASS} />
      </div>
    </div>
  );
}

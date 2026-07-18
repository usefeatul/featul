"use client";

import { cn } from "@featul/ui/lib/utils";
import { usePathname } from "next/navigation";

type SeparatorVariant = "dots" | "line" | "zigzag" | "table" | "blueprint";

interface LinearSeparatorProps {
  className?: string;
  variant?: SeparatorVariant;
}

const LINE_VARIANT_CLASS =
  "h-px w-full bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.08)_100%)] bg-[length:100%_1px] bg-no-repeat bg-origin-content";

const PATTERN_WRAPPER_CLASS = "relative h-14 w-full px-2 sm:h-18 md:px-0";
const PATTERN_FRAME_CLASS =
  "absolute inset-y-0 left-1 right-1 bg-neutral-50 md:left-0 md:right-0";
const PATTERN_RULES_CLASS =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.1),rgba(0,0,0,0.1)),linear-gradient(to_right,rgba(0,0,0,0.1),rgba(0,0,0,0.1))] bg-[length:100%_1px,100%_1px] bg-[position:left_top,left_bottom] bg-no-repeat";
const PATTERN_FILL_CLASS = "absolute inset-x-1 bottom-1 top-1 opacity-50";
const DOTS_PATTERN_CLASS =
  "bg-[radial-gradient(circle_at_1px_1px,var(--primary)_1px,transparent_1px)] bg-[length:12px_12px] bg-repeat bg-top";
const ZIGZAG_PATTERN_CLASS =
  "bg-[linear-gradient(135deg,transparent_0_9px,var(--primary)_9px_11px,transparent_11px_20px),linear-gradient(45deg,transparent_0_9px,var(--primary)_9px_11px,transparent_11px_20px)] bg-[length:28px_28px] bg-[position:0_1px,14px_1px] bg-repeat";
const TABLE_PATTERN_CLASS =
  "bg-[linear-gradient(to_right,var(--primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--primary)_1px,transparent_1px)] bg-[length:18px_18px] bg-repeat";
const BLUEPRINT_PATTERN_CLASS =
  "bg-[radial-gradient(circle_at_center,var(--primary)_1px,transparent_1.5px),linear-gradient(to_right,transparent_0_10px,var(--primary)_10px_11px,transparent_11px_22px),linear-gradient(to_bottom,transparent_0_10px,var(--primary)_10px_11px,transparent_11px_22px),radial-gradient(ellipse_at_center,hsl(var(--primary)/0.16)_0%,transparent_62%)] bg-[length:22px_22px,22px_22px,22px_22px,100%_100%] bg-[position:11px_11px,0_0,0_0,0_0] bg-repeat";

const patternClassByVariant: Record<
  Exclude<SeparatorVariant, "line">,
  string
> = {
  dots: DOTS_PATTERN_CLASS,
  zigzag: ZIGZAG_PATTERN_CLASS,
  table: TABLE_PATTERN_CLASS,
  blueprint: BLUEPRINT_PATTERN_CLASS,
};

export function LinearSeparator({
  className,
  variant = "zigzag",
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
    <div className={cn(PATTERN_WRAPPER_CLASS, className)}>
      <div className={PATTERN_FRAME_CLASS}>
        <div className={PATTERN_RULES_CLASS} />
        <div className={cn(PATTERN_FILL_CLASS, patternClassByVariant[variant])} />
      </div>
    </div>
  );
}

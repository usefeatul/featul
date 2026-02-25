"use client";

import { cn } from "@featul/ui/lib/utils";

type LastUsedTagProps = {
  tone?: "default" | "onPrimary";
  className?: string;
};

export function LastUsedTag({
  tone = "default",
  className,
}: LastUsedTagProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -top-2 right-1 rounded-sm px-1.5 py-0.5 text-[10px] leading-none text-white",
        tone === "onPrimary"
          ? "border border-white/70 bg-primary/95 font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.22)]"
          : "border border-primary/70 bg-primary font-normal shadow-[0_1px_2px_rgba(0,0,0,0.14)]",
        className,
      )}
    >
      Last used
    </span>
  );
}

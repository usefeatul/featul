"use client";

import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";
import { cn } from "@featul/ui/lib/utils";

type HeroCtaProps = {
  hotkeyLabel?: string;
  liveDemoClassName?: string;
  className?: string;
};

const heroButtonClassName =
  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto";

export function HeroCta({
  hotkeyLabel,
  liveDemoClassName,
  className,
}: HeroCtaProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col items-stretch justify-start gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4",
        className,
      )}
    >
      <HotkeyLink
        variant="nav"
        className={cn(
          heroButtonClassName,
          "border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        )}
        label={hotkeyLabel}
      />
      <LiveDemo
        className={cn(heroButtonClassName, "text-accent", liveDemoClassName)}
      />
    </div>
  );
}

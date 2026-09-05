"use client";

import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";
import { cn } from "@featul/ui/lib/utils";

export const skyPrimaryCtaClass =
  "border-white/85 bg-white text-foreground ring-white/70 ring-offset-[#0063d2] hover:bg-white/92 hover:text-foreground";

export const skySecondaryCtaClass =
  "border-white/70 bg-white/15 text-white ring-white/45 ring-offset-[#0063d2] hover:bg-white/25 hover:text-white";

export const skyKbdClassName = "bg-accent/15 text-accent";

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
        className={cn(heroButtonClassName, skyPrimaryCtaClass)}
        kbdClassName={skyKbdClassName}
        label={hotkeyLabel}
      />
      <LiveDemo
        className={cn(
          heroButtonClassName,
          skySecondaryCtaClass,
          liveDemoClassName,
        )}
      />
    </div>
  );
}

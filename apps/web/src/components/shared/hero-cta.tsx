"use client";

import { HotkeyLink } from "@/components/global/hotkey-link";
import { LiveDemo } from "@/components/global/live-demo";
import { cn } from "@featul/ui/lib/utils";

type HeroCtaProps = {
  hotkeyLabel?: string;
  liveDemoClassName?: string;
  className?: string;
};

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
      <HotkeyLink className="w-full sm:w-auto" label={hotkeyLabel} />
      <LiveDemo
        className={cn(
          "min-h-[40px] w-full min-w-[40px] text-accent sm:w-auto",
          liveDemoClassName,
        )}
      />
    </div>
  );
}

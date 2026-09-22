"use client";

import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";
import { cn } from "@featul/ui/lib/utils";

export const heroPrimaryCtaClass =
  "border-primary/80 bg-primary text-primary-foreground ring-primary/30 hover:bg-primary/90 hover:text-primary-foreground";

export const heroSecondaryCtaClass =
  "border-border bg-muted text-foreground ring-border/50 hover:bg-muted/80 hover:text-foreground";

export const heroKbdClassName = "bg-primary-foreground/20 text-primary-foreground";

/** Navbar CTA on sky-backed pages (white button on blue bar) */
export const skyPrimaryCtaClass =
  "border-white/85 bg-white text-foreground ring-white/70 ring-offset-[#0063d2] hover:bg-white/92 hover:text-foreground";

export const skySecondaryCtaClass =
  "border-white/70 bg-white/15 text-white ring-white/45 ring-offset-[#0063d2] hover:bg-white/25 hover:text-white";

export const skyKbdClassName = "bg-accent/15 text-accent";

/** CTA styles for cards placed over the sky image background */
export const skyCardPrimaryCtaClass =
  "border-white/85 bg-white text-foreground ring-white/70 hover:bg-white/92 hover:text-foreground";

export const skyCardSecondaryCtaClass =
  "border-white/70 bg-white/15 text-white ring-white/45 hover:bg-white/25 hover:text-white";

export const skyCardKbdClassName = "bg-accent/15 text-accent";

type HeroCtaProps = {
  hotkeyLabel?: string;
  liveDemoClassName?: string;
  className?: string;
  centered?: boolean;
};

const heroButtonClassName =
  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto";

export function HeroCta({
  hotkeyLabel,
  liveDemoClassName,
  className,
  centered = false,
}: HeroCtaProps) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col items-stretch justify-start gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4",
        centered && "sm:justify-center",
        className,
      )}
    >
      <HotkeyLink
        variant="nav"
        className={cn(heroButtonClassName, heroPrimaryCtaClass)}
        kbdClassName={heroKbdClassName}
        label={hotkeyLabel}
      />
      <LiveDemo
        className={cn(
          heroButtonClassName,
          heroSecondaryCtaClass,
          liveDemoClassName,
        )}
      />
    </div>
  );
}

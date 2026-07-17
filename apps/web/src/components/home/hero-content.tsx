"use client";

import { FreeIcon } from "@featul/ui/icons/free";
import { UsersIcon } from "@featul/ui/icons/users";
import { SetupIcon } from "@featul/ui/icons/setup";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";
import { cn } from "@featul/ui/lib/utils";

type HeroContentProps = {
  variant?: "overlay" | "default";
};

export function HeroContent({ variant = "overlay" }: HeroContentProps) {
  const isOverlay = variant === "overlay";

  return (
    <div
      className={cn(
        "mx-auto max-w-3xl",
        isOverlay ? "text-center" : "max-w-none text-left"
      )}
      data-component="HeroContent"
    >
      <h1
        className={cn(
          "font-heading text-3xl font-semibold leading-tight tracking-normal text-balance sm:text-4xl md:text-5xl md:tracking-tight",
          isOverlay ? "text-white" : "text-foreground"
        )}
      >
        The{" "}
        <span
          className={cn(
            "mx-1 inline-flex items-center rounded-md px-2 py-[2px] align-baseline sm:mx-2",
            isOverlay
              ? "bg-white/20 text-white"
              : "bg-primary/30 text-black/70"
          )}
        >
          simple and fast
        </span>{" "}
        customer feedback alternative
      </h1>
      <p
        className={cn(
          "mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-balance sm:text-base md:text-lg",
          isOverlay ? "text-white/85" : "text-accent"
        )}
      >
        Featul is a privacy-first, open-source customer feedback platform
        that&apos;s both insightful and lightweight
      </p>
      <div
        className={cn(
          "mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-stretch sm:gap-4",
          isOverlay ? "justify-center" : "justify-start"
        )}
      >
        <HotkeyLink
          className="w-full sm:w-auto"
          label="Add to your website"
        />
        <LiveDemo className="w-full sm:w-auto" overlay />
      </div>
      <div
        className={cn(
          "mt-8 flex flex-wrap items-center gap-3 text-xs sm:gap-6",
          isOverlay ? "justify-center text-white/80" : "text-accent"
        )}
        aria-label="Key highlights"
      >
        <span className="inline-flex items-center gap-2">
          <FreeIcon
            width={14}
            height={14}
            className={isOverlay ? "text-white" : "text-foreground"}
          />
          Free forever
        </span>
        <span className="inline-flex items-center gap-2">
          <SetupIcon
            width={14}
            height={14}
            className={isOverlay ? "text-white" : "text-foreground"}
          />
          30-second setup
        </span>
        <span className="inline-flex items-center gap-2">
          <UsersIcon
            width={14}
            height={14}
            className={isOverlay ? "text-white" : "text-foreground"}
          />
          Unlimited users
        </span>
      </div>
    </div>
  );
}

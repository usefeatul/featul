import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";
import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";
import { DitherBackdrop } from "@/components/home/backdrop";
import {
  heroPrimaryCtaClass,
  skyCardKbdClassName,
  skyCardPrimaryCtaClass,
} from "./cta";

/** Shared bottom CTA appearance for the homepage and comparison pages. */
export function Promotion({
  title,
  description,
  eyebrow,
  label = "Start for free",
}: {
  title: ReactNode;
  description: ReactNode;
  eyebrow?: ReactNode;
  label?: string;
}) {
  return (
    <div className="relative isolate flex min-h-96 flex-col overflow-hidden rounded-xl border border-border bg-card px-6 pb-6 pt-12 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_24px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] sm:px-7 sm:pb-7 sm:pt-16">
      <DitherBackdrop multicolor fit="cover" className="scale-175" />
      {eyebrow ? (
        <p className="mb-3 text-sm text-neutral-700">{eyebrow}</p>
      ) : null}
      <h2 className="font-heading max-w-lg text-balance text-xl font-medium text-black sm:max-w-2xl sm:text-2xl lg:text-3xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base text-neutral-700 sm:text-lg">
        {description}
      </p>
      <div className="mt-auto flex flex-col items-stretch gap-3 pt-8 sm:flex-row sm:items-center sm:gap-4">
        <HotkeyLink
          variant="nav"
          className={cn(
            "group h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto",
            skyCardPrimaryCtaClass,
          )}
          kbdClassName={skyCardKbdClassName}
          label={label}
        />
        <LiveDemo
          variant="default"
          className={cn(
            "h-10 min-h-[40px] w-full min-w-[40px] shadow-sm sm:w-auto",
            heroPrimaryCtaClass,
          )}
        />
      </div>
    </div>
  );
}

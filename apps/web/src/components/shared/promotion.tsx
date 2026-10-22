import type { ReactNode } from "react";
import {
  modalCardInnerClass,
  modalCardShellClass,
} from "@featul/ui/lib/overlay";
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
  eyebrow = "Get started with Featul",
  action,
  label = "Start for free",
}: {
  title: ReactNode;
  description: ReactNode;
  /** Settings-card style title in the shell header row. */
  eyebrow?: ReactNode;
  /** Right side of the shell header row. */
  action?: ReactNode;
  label?: string;
}) {
  return (
    <section className={cn(modalCardShellClass, "flex min-w-0 flex-col")}>
      <header className="flex flex-wrap items-center justify-between gap-3 px-2.5 py-1.5">
        <p className="text-sm font-medium leading-6 text-foreground">
          {eyebrow}
        </p>
        {action ? <div className="text-sm text-accent">{action}</div> : null}
      </header>
      <div
        className={cn(
          modalCardInnerClass,
          "relative isolate flex min-h-96 flex-col px-6 pb-6 pt-12 sm:px-7 sm:pb-7 sm:pt-16",
        )}
      >
        <DitherBackdrop multicolor fit="cover" className="scale-175" />
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
    </section>
  );
}

"use client";

import type { ReactNode } from "react";

import { DitherGradient } from "@/components/dither-kit/gradient";
import type { PixelColor } from "@/components/dither-kit/pixel";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

export function VisualCardWell({
  color,
  step,
  label,
  badge,
  children,
  className,
}: {
  color: PixelColor;
  step?: string;
  label?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[240px] w-full flex-1 flex-col overflow-hidden bg-background sm:min-h-[300px]",
        className,
      )}
    >
      <DitherGradient
        from={color}
        to="transparent"
        direction="down"
        cell={3}
        bloom="low"
        opacity={0.9}
        className="[mask-image:radial-gradient(130%_120%_at_50%_0%,black_35%,transparent_88%)]"
      />
      {badge ? (
        <div className="absolute left-3 top-3 z-10">{badge}</div>
      ) : null}
      {step || label ? (
        <div className="relative z-10 flex items-baseline gap-2 px-4 pt-4 sm:px-5">
          {step ? (
            <span className="text-accent text-xs font-medium tabular-nums">
              {step}
            </span>
          ) : null}
          {label ? (
            <p className="text-foreground text-sm font-medium">{label}</p>
          ) : null}
        </div>
      ) : null}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        {children}
      </div>
    </div>
  );
}

export function NestedOverlayCard({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={cn(overlayDialogClass, className)}>
      <div className={cn(overlayInnerClass, innerClassName)}>{children}</div>
    </div>
  );
}

export function VisualCardIconTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <NestedOverlayCard
      className={cn(
        "size-16 shrink-0 p-1.5 transition-transform duration-200 group-hover:scale-[1.03] sm:size-[4.5rem]",
        className,
      )}
      innerClassName="flex size-full items-center justify-center"
    >
      {children}
    </NestedOverlayCard>
  );
}

"use client";

import type { ReactNode } from "react";

import {
  DitherGradient,
  type GradientDirection,
} from "@/components/dither-kit/gradient";
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
  compact = false,
}: {
  color: PixelColor;
  step?: string;
  label?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-1 flex-col overflow-hidden bg-background",
        compact
          ? "min-h-[92px] sm:min-h-[104px]"
          : "min-h-[240px] sm:min-h-[300px]",
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
        <div className={cn("absolute z-10", compact ? "left-2.5 top-2.5" : "left-3 top-3")}>
          {badge}
        </div>
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
      <div
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center",
          compact
            ? "px-3 pb-3 pt-7"
            : "px-5 pb-6 pt-2 sm:px-8 sm:pb-8",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SubtleDitherWash({
  color,
  className,
  direction = "right",
  opacity = 0.18,
}: {
  color: PixelColor;
  className?: string;
  direction?: GradientDirection;
  opacity?: number;
}) {
  const fromTop = direction === "down" || direction === "up";

  return (
    <DitherGradient
      from={color}
      to="transparent"
      direction={direction}
      cell={4}
      bloom="off"
      opacity={opacity}
      className={cn(
        fromTop
          ? "[mask-image:linear-gradient(to_bottom,black_0%,transparent_62%)]"
          : "[mask-image:linear-gradient(to_right,black_0%,transparent_62%)]",
        className,
      )}
    />
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

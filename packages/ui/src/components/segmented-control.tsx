"use client";

import * as React from "react";
import { MotionConfig, motion } from "framer-motion";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Accessible name when the label is icon-only. */
  ariaLabel?: string;
  title?: string;
};

const squircleClass =
  "[corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.5)]";

/** Recessed track the raised pill slides along. */
export const segmentedTrackClass =
  "inline-flex w-fit items-center gap-0.5 rounded-lg border border-border/70 bg-muted/40 p-0.5 [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*2)] dark:border-white/[0.06] dark:bg-black/20";

const sizeClass = {
  sm: "h-6 px-2 text-xs",
  default: "h-7 px-2.5 text-xs",
  md: "h-8 px-3 text-sm",
} as const;

/**
 * Pill switcher: the selected option wears the button's raised surface and slides
 * between options with a short spring.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  size = "default",
  className,
  itemClassName,
  disabled,
  "aria-label": ariaLabel,
}: {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<SegmentedOption<T>>;
  size?: keyof typeof sizeClass;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const pillId = React.useId();
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const move = (from: number, step: 1 | -1) => {
    for (let i = 1; i <= options.length; i++) {
      const next = (from + step * i + options.length) % options.length;
      const option = options[next];
      if (option && !option.disabled) {
        onValueChange(option.value);
        refs.current[next]?.focus();
        return;
      }
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div role="radiogroup" aria-label={ariaLabel} className={cn(segmentedTrackClass, className)}>
        {options.map((option, index) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.ariaLabel}
              title={option.title}
              tabIndex={active ? 0 : -1}
              disabled={disabled || option.disabled}
              onClick={() => onValueChange(option.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  move(index, 1);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  move(index, -1);
                }
              }}
              className={cn(
                "relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap text-accent outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
                squircleClass,
                sizeClass[size],
                active && "text-foreground",
                itemClassName,
              )}
            >
              {active ? (
                <motion.span
                  layoutId={pillId}
                  aria-hidden
                  className={cn(raisedSurfaceClass, "absolute inset-0 rounded-md", squircleClass)}
                  transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.8 }}
                />
              ) : null}
              {option.icon ? <span className="relative inline-flex">{option.icon}</span> : null}
              {option.label != null && option.label !== "" ? (
                <span className="relative">{option.label}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </MotionConfig>
  );
}

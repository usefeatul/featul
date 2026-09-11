import { useId } from "react";

import { cn } from "@featul/ui/lib/utils";

type SquarePatternProps = {
  className?: string;
  /** Drawn square size in px. */
  size?: number;
  /** Space between squares in px. */
  gap?: number;
};

export function SquarePattern({
  className,
  size = 12,
  gap = 20,
}: SquarePatternProps) {
  const patternId = `sq${useId().replace(/:/g, "")}`;
  const cell = size + gap;

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none block text-primary/16", className)}
      width="100%"
      height="100%"
    >
      <defs>
        <pattern
          id={patternId}
          width={cell}
          height={cell}
          patternUnits="userSpaceOnUse"
        >
          <rect width={size} height={size} rx={1.5} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

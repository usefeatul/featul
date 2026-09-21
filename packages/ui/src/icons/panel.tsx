import type { SVGProps } from "react";
import { cn } from "../lib/utils";

export function PanelIcon({
  side = "left",
  filled = false,
  className,
  ...props
}: SVGProps<SVGSVGElement> & {
  side?: "left" | "right";
  filled?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={cn("text-neutral-600 dark:text-neutral-300", className)}
      {...props}
    >
      <g
        transform={side === "right" ? "translate(18 0) scale(-1 1)" : undefined}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {filled ? (
          <path
            d="M3.75 3.5H5.25V14.5H3.75C3.06 14.5 2.5 13.94 2.5 13.25V4.75C2.5 4.06 3.06 3.5 3.75 3.5Z"
            fill="currentColor"
            stroke="none"
          />
        ) : null}
        <rect
          x={1.75}
          y={2.75}
          width={14.5}
          height={12.5}
          rx={2}
          stroke="currentColor"
        />
        <path d="M6 2.75V15.25" stroke="currentColor" />
      </g>
    </svg>
  );
}

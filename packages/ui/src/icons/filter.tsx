import type { SVGProps } from "react";

// Based on the user-provided RuneIcon artwork (https://runeicon.com).
export function FilterIcon({ size = 18, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <g transform="translate(0.75, 0.75) scale(0.9375)" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 5H22M6 12H18M9 19H15" />
      </g>
    </svg>
  );
}

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function FilterIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path d="M5 5h14a.75.75 0 0 1 .55 1.26L13.75 12.5V18a.75.75 0 0 1-.41.67l-2 .75a.75.75 0 0 1-1.09-.67V12.5L4.45 6.26A.75.75 0 0 1 5 5Z" />
    </svg>
  );
}

export function LowTractionIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path d="M7.2 4.2A10.8 10.8 0 0 1 12 3c5.5 0 10 4 10 9a8.4 8.4 0 0 1-1.8 5.2l-13-13ZM3.8 7.2A8.3 8.3 0 0 0 2 12c0 1.9.6 3.6 1.7 5.1L2.5 21l4.4-1.1A11 11 0 0 0 12 21c1.8 0 3.4-.4 4.8-1.2l-13-12.6Z" />
      <path d="M2.3 2.3a1 1 0 0 1 1.4 0l18 18a1 1 0 0 1-1.4 1.4l-18-18a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

export function LogoutIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 3h7a1 1 0 0 1 1 1v4H9v8h3v4a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M17.3 7.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4l2.3-2.3H11v-2h8.6l-2.3-2.3a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

export { RoadmapIcon, ChangelogIcon } from "@featul/ui/icons/product";

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 11 12-6 .9 1.8-12 6L6 11Zm0 2 12 6 .9-1.8-12-6L6 13Z" />
      <circle cx={6} cy={12} r={3.5} />
      <circle cx={18} cy={6} r={3.5} />
      <circle cx={18} cy={18} r={3.5} />
    </svg>
  );
}
